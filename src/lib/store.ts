import { create } from "zustand";
import type { Task } from "@/lib/tasks";
import type { TestCase, EvaluationResult } from "@/lib/evaluator";
import { saveCurrentSession, loadCurrentSession, saveProgress as saveProgressToStorage, loadProgress as loadProgressFromStorage, saveAttempt, loadAttempts, getTaskHistory, loadStreak, saveStreak, clearAllProgress, type TaskProgress as StorageTaskProgress, type AttemptRecord, type StreakData } from "@/lib/storage";

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
    set({ selectedTask: task, testCases: [], evaluationResult: null });
    if (task) {
      // Load saved session for this task
      const saved = loadCurrentSession(task.id);
      if (saved && saved.length > 0) {
        set({ testCases: saved });
      }
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
    set({ testCases: [] });
  },

  evaluationResult: null,
  setEvaluationResult: (result) => set({ evaluationResult: result }),

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
    clearAllProgress();
    set({ savedProgress: {} });
  },
}));
