import { create } from "zustand";
import type { Task } from "@/lib/tasks";
import type { TestCase, EvaluationResult } from "@/lib/evaluator";
import { evaluateTestCases } from "@/lib/evaluator";
import { saveCurrentSession, loadCurrentSession, saveProgress as saveProgressToStorage, loadProgress as loadProgressFromStorage, saveAttempt, loadAttempts, getTaskHistory, loadStreak, saveStreak, clearAllProgress as clearAllProgressFromStorage, type TaskProgress as StorageTaskProgress, type AttemptRecord, type StreakData } from "@/lib/storage";
import { checkAndUnlockAchievements, type AchievementContext } from "@/lib/achievements";
import { tasks } from "@/lib/tasks";
import { toast } from "sonner";

export type { TaskProgress as StorageTaskProgress, AttemptRecord, StreakData } from "@/lib/storage";

interface AppState {
  // Tab navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Task selection
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;

  // Test cases for current task
  testCases: TestCase[];
  addTestCase: (testCase: TestCase) => void;
  removeTestCase: (id: string) => void;
  reorderTestCases: (testCases: TestCase[]) => void;
  clearTestCases: () => void;

  // Evaluation
  evaluationResult: EvaluationResult | null;
  setEvaluationResult: (result: EvaluationResult | null) => void;
  submitTestCases: () => EvaluationResult | null;

  // Progress persistence
  savedProgress: Record<number, StorageTaskProgress>;
  updateProgress: (taskId: number, score: number, testCases: TestCase[]) => void;
  loadProgress: () => void;

  // Session persistence
  loadSession: (taskId: number) => void;
  saveSession: () => void;

  // Statistics (exposed via store for consistency)
  loadStreak: () => StreakData;
  saveStreak: (streak: StreakData) => void;
  loadAttempts: () => AttemptRecord[];
  saveAttempt: (record: AttemptRecord) => void;
  getTaskHistory: (taskId: number) => AttemptRecord[];

  // Utils
  clearAllProgress: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: "tasks",
  setActiveTab: (tab) => set({ activeTab: tab }),

  selectedTask: null,
  setSelectedTask: (task) => {
    const state = get();
    // If re-selecting the same task, do nothing — preserve current test cases
    if (state.selectedTask && task && state.selectedTask.id === task.id) return;
    // Load saved session for the new task
    if (task) {
      const saved = loadCurrentSession(task.id);
      set({ selectedTask: task, testCases: saved ?? [], evaluationResult: null });
    } else {
      set({ selectedTask: null, testCases: [], evaluationResult: null });
    }
  },

  testCases: [],
  addTestCase: (testCase) =>
    set((state) => {
      const testCases = [...state.testCases, testCase];
      // Auto-save session
      if (state.selectedTask) {
        saveCurrentSession(state.selectedTask.id, testCases);
      }
      return { testCases };
    }),
  removeTestCase: (id) =>
    set((state) => {
      const testCases = state.testCases.filter((tc) => tc.id !== id);
      if (state.selectedTask) {
        saveCurrentSession(state.selectedTask.id, testCases);
      }
      return { testCases };
    }),
  reorderTestCases: (testCases) => {
    const state = get();
    if (state.selectedTask) {
      saveCurrentSession(state.selectedTask.id, testCases);
    }
    set({ testCases });
  },
  clearTestCases: () => {
    const state = get();
    if (state.selectedTask) {
      saveCurrentSession(state.selectedTask.id, []);
    }
    set({ testCases: [], evaluationResult: null });
  },

  evaluationResult: null,
  setEvaluationResult: (result) => set({ evaluationResult: result }),
  submitTestCases: () => {
    const state = get();
    if (!state.selectedTask || state.testCases.length === 0) return null;
    const result = evaluateTestCases(state.selectedTask, state.testCases);
    set({ evaluationResult: result });
    saveProgressToStorage(state.selectedTask.id, result.overallScore, state.testCases);
    saveAttempt({
      taskId: state.selectedTask.id,
      score: result.overallScore,
      ecCoverage: result.ecCoverage,
      bvCoverage: result.boundaryCoverage,
      correctnessScore: result.correctnessScore,
      timestamp: Date.now(),
      testCasesCount: state.testCases.length,
    });
    set({ savedProgress: loadProgressFromStorage() });

    // Check and unlock achievements
    const newlyUnlocked = checkAndUnlockAchievements(buildAchievementContext());
    for (const _id of newlyUnlocked) {
      toast.success(`🏆 Достижение разблокировано!`);
    }

    return result;
  },

  savedProgress: {},
  updateProgress: (taskId, score, testCases) => {
    saveProgressToStorage(taskId, score, testCases);
    // Reload progress from storage
    set({ savedProgress: loadProgressFromStorage() });
  },
  loadProgress: () => {
    set({ savedProgress: loadProgressFromStorage() });
  },

  loadSession: (taskId) => {
    const saved = loadCurrentSession(taskId);
    if (saved && saved.length > 0) {
      set({ testCases: saved });
    } else {
      set({ testCases: [] });
    }
  },
  saveSession: () => {
    const state = get();
    if (state.selectedTask) {
      saveCurrentSession(state.selectedTask.id, state.testCases);
    }
  },

  loadStreak: () => loadStreak(),
  saveStreak: (streak) => saveStreak(streak),
  loadAttempts: () => loadAttempts(),
  saveAttempt: (record) => saveAttempt(record),
  getTaskHistory: (taskId) => getTaskHistory(taskId),

  clearAllProgress: () => {
    clearAllProgressFromStorage();
    set({ savedProgress: {} });
  },
}));

/**
 * Builds an AchievementContext from current localStorage data.
 * Used by both trainer and exam mode for achievement checking.
 */
export function buildAchievementContext(): AchievementContext {
  const progress = loadProgressFromStorage();
  const attempts = loadAttempts();

  const bestScores: Record<number, number> = {};
  for (const [taskIdStr, p] of Object.entries(progress)) {
    const taskId = Number(taskIdStr);
    bestScores[taskId] = Math.max(bestScores[taskId] ?? 0, p.score);
  }

  const perfectScores = Object.values(progress).filter((p) => p.score === 100).length;
  const completedTasks = Object.keys(progress).length;

  return {
    completedTasks,
    totalTasks: tasks.length,
    bestScores,
    totalAttempts: attempts.length,
    perfectScores,
    attemptHistory: attempts.map((a) => ({
      taskId: a.taskId,
      score: a.score,
      timestamp: a.timestamp,
    })),
  };
}
