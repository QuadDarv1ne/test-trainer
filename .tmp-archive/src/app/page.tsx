"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tasks, runReferenceFunction } from "@/lib/tasks";
import type { Task, Difficulty, TestCaseCategory } from "@/lib/tasks";
import type { TestCase, EvaluationResult } from "@/lib/evaluator";
import { evaluateTestCases } from "@/lib/evaluator";
import { UndoStack } from "@/lib/undo-stack";
import {
  saveProgress,
  loadProgress,
  saveCurrentSession,
  loadCurrentSession,
  exportAllProgress,
  importAllProgress,
  clearAllProgress,
  saveAttempt,
  loadAttemptHistory,
  saveStreak,
  loadStreak,
  getTaskBestCoverage,
  type TaskProgress,
  type AttemptRecord,
} from "@/lib/storage";
import { TaskCard } from "@/components/task-card";
import { TaskWorkspace } from "@/components/task-workspace";
import { TestForm } from "@/components/test-form";
import { TestList } from "@/components/test-list";
import { ResultsPanel } from "@/components/results-panel";
import { TheoryPanel } from "@/components/theory-panel";
import { StatisticsPanel } from "@/components/statistics-panel";
import { ExamMode } from "@/components/exam-mode";
import { Confetti } from "@/components/confetti";
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts";
import { AchievementsPanel, AchievementToast } from "@/components/achievements-panel";
import { Onboarding } from "@/components/onboarding";
import { checkAndUnlockAchievements, achievements as allAchievements } from "@/lib/achievements";
import {
  Beaker,
  ListChecks,
  Dumbbell,
  BarChart3,
  BookOpen,
  ArrowLeft,
  Sun,
  Moon,
  Trophy,
  RotateCcw,
  HelpCircle,
  Download,
  Upload,
  TrendingUp,
  Timer,
  Award,
  Flame,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const TOTAL_TASKS = tasks.length;

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};



function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 text-muted-foreground hover:text-foreground"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      suppressHydrationWarning
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResult | null>(null);
  const [savedProgress, setSavedProgress] = useState<Record<number, TaskProgress>>(() => {
    if (typeof window !== "undefined") {
      return loadProgress();
    }
    return {};
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [attemptHistory, setAttemptHistory] = useState<AttemptRecord[]>(() => loadAttemptHistory);
  const [streak, setStreak] = useState(() => loadStreak());
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // Feature 2: Task Filtering and Sorting
  const [difficultyFilter, setDifficultyFilter] = useState<"Все" | Difficulty>("Все");
  const [sortMode, setSortMode] = useState<"По номеру" | "По имени" | "По сложности">("По номеру");

  // Feature 1: Task Search
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
    // Difficulty filter
    if (difficultyFilter !== "Все") {
      filtered = filtered.filter((t) => t.difficulty === difficultyFilter);
    }
    // Sort
    const difficultyOrder: Record<Difficulty, number> = { "Легко": 1, "Средне": 2, "Сложно": 3 };
    switch (sortMode) {
      case "По номеру":
        return [...filtered].sort((a, b) => a.id - b.id);
      case "По имени":
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name, "ru"));
      case "По сложности":
        return [...filtered].sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
      default:
        return filtered;
    }
  }, [difficultyFilter, sortMode, searchQuery]);

  // Feature 4: Undo/Redo
  const undoStackRef = useRef(new UndoStack<TestCase[]>());
  const undoStack = undoStackRef.current;

  const pushUndoSnapshot = useCallback(() => {
    undoStack.push([...testCases]);
  }, [testCases, undoStack]);

  const handleUndo = useCallback(() => {
    const prev = undoStack.undo();
    if (prev) {
      setTestCases(prev);
      if (selectedTask) {
        saveCurrentSession(selectedTask.id, prev);
      }
      toast.info("Действие отменено");
    }
  }, [undoStack, selectedTask]);

  const handleRedo = useCallback(() => {
    const next = undoStack.redo();
    if (next) {
      setTestCases(next);
      if (selectedTask) {
        saveCurrentSession(selectedTask.id, next);
      }
      toast.info("Действие возвращено");
    }
  }, [undoStack, selectedTask]);

  const completedCount = useMemo(() => {
    return Object.keys(savedProgress).length;
  }, [savedProgress]);

  // Feature 6: Best coverage per task (computed from attemptHistory)
  const taskBestCoverage = useMemo(() => {
    const map: Record<number, { bestEc: number; bestBv: number }> = {};
    for (const task of tasks) {
      map[task.id] = getTaskBestCoverage(task.id);
    }
    return map;
  }, [attemptHistory]);

  const handleSelectTask = useCallback(
    (task: Task) => {
      setSelectedTask(task);
      setEvaluationResult(null);
      setActiveTab("trainer");

      // Load saved session for this task
      const savedSession = loadCurrentSession(task.id);
      if (savedSession && savedSession.length > 0) {
        setTestCases(savedSession);
      } else {
        setTestCases([]);
      }

      // Reset undo stack when switching tasks
      undoStack.clear();
    },
    [undoStack]
  );

  const handleAddTestCase = useCallback(
    (
      inputs: string[],
      expected: string,
      category: TestCaseCategory,
      comment: string
    ) => {
      // Check for duplicate inputs
      const inputKey = inputs.join("||");
      const isDuplicate = testCases.some(
        (tc) => tc.inputs.join("||") === inputKey
      );
      if (isDuplicate) {
        toast.warning("Такие входные данные уже есть в списке тест-кейсов");
        return;
      }

      pushUndoSnapshot();

      const newCase: TestCase = {
        id: `tc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        inputs,
        expectedOutput: expected,
        category,
        comment,
      };
      setTestCases((prev) => {
        const updated = [...prev, newCase];
        if (selectedTask) {
          saveCurrentSession(selectedTask.id, updated);
        }
        return updated;
      });
      toast.success("Тест-кейс добавлен");
    },
    [selectedTask, testCases, pushUndoSnapshot]
  );

  const handleRemoveTestCase = useCallback(
    (id: string) => {
      const tc = testCases.find((t) => t.id === id);
      pushUndoSnapshot();

      setTestCases((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        if (selectedTask) {
          saveCurrentSession(selectedTask.id, updated);
        }
        return updated;
      });
      if (tc) {
        toast.info("Тест-кейс удалён", {
          action: {
            label: "Отменить",
            onClick: () => {
              setTestCases((prev) => {
                const restored = [...prev, tc];
                if (selectedTask) {
                  saveCurrentSession(selectedTask.id, restored);
                }
                return restored;
              });
              toast.success("Тест-кейс восстановлен");
            },
          },
          duration: 5000,
        });
      }
    },
    [selectedTask, testCases, pushUndoSnapshot]
  );

  const handleReorderTestCases = useCallback(
    (reordered: TestCase[]) => {
      pushUndoSnapshot();
      setTestCases(reordered);
      if (selectedTask) {
        saveCurrentSession(selectedTask.id, reordered);
      }
    },
    [selectedTask, pushUndoSnapshot]
  );

  const handleEditTestCase = useCallback(
    (id: string, updates: Partial<{inputs: string[], expectedOutput: string, category: TestCaseCategory, comment: string}>) => {
      pushUndoSnapshot();
      setTestCases((prev) => {
        const updated = prev.map((tc) =>
          tc.id === id ? { ...tc, ...updates } : tc
        );
        if (selectedTask) {
          saveCurrentSession(selectedTask.id, updated);
        }
        return updated;
      });
      toast.success("Тест-кейс обновлён");
    },
    [selectedTask, pushUndoSnapshot]
  );

  // Feature 3: Duplicate test case
  const handleDuplicateTestCase = useCallback(
    (id: string) => {
      const tc = testCases.find((t) => t.id === id);
      if (!tc) return;

      pushUndoSnapshot();

      const clone: TestCase = {
        ...tc,
        id: `tc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        comment: tc.comment ? `${tc.comment} (копия)` : "копия",
      };

      setTestCases((prev) => {
        // Insert after the original
        const idx = prev.findIndex((t) => t.id === id);
        const updated = [...prev];
        updated.splice(idx + 1, 0, clone);
        if (selectedTask) {
          saveCurrentSession(selectedTask.id, updated);
        }
        return updated;
      });
      toast.success("Тест-кейс дублирован");
    },
    [testCases, selectedTask, pushUndoSnapshot]
  );

  // Feature 7: Bulk remove test cases
  const handleBulkRemove = useCallback(
    (ids: string[]) => {
      pushUndoSnapshot();
      setTestCases((prev) => {
        const updated = prev.filter((t) => !ids.includes(t.id));
        if (selectedTask) {
          saveCurrentSession(selectedTask.id, updated);
        }
        return updated;
      });
      toast.success(`Удалено тест-кейсов: ${ids.length}`);
    },
    [selectedTask, pushUndoSnapshot]
  );

  const handleSubmit = useCallback(() => {
    if (!selectedTask || testCases.length === 0) return;
    const result = evaluateTestCases(selectedTask, testCases);
    setEvaluationResult(result);
    setActiveTab("results");

    // Save best progress
    saveProgress(selectedTask.id, result.overallScore, testCases);
    setSavedProgress(loadProgress());

    // Save attempt to history
    saveAttempt({
      taskId: selectedTask.id,
      score: result.overallScore,
      ecCoverage: result.ecCoverage,
      bvCoverage: result.boundaryCoverage,
      correctnessScore: result.correctnessScore,
      timestamp: Date.now(),
      testCasesCount: testCases.length,
    });
    setAttemptHistory(loadAttemptHistory());

    // Update streak
    const updatedStreak = saveStreak();
    setStreak(updatedStreak);

    // Check achievements
    const history = loadAttemptHistory();
    const progress = loadProgress();
    // Calculate max EC/BV coverage across all attempts
    const maxEc = history.reduce((max, h) => Math.max(max, h.ecCoverage ?? 0), 0);
    const maxBv = history.reduce((max, h) => Math.max(max, h.bvCoverage ?? 0), 0);

    // Calculate exam stats from history
    const examScores = history.filter((h) => h.testCasesCount > 0);
    const examsCompleted = examScores.length;
    const examAvgScore = examsCompleted > 0 ? Math.round(examScores.reduce((s, h) => s + h.score, 0) / examsCompleted) : 0;

    const context = {
      completedTasks: Object.keys(progress).length,
      totalTasks: tasks.length,
      bestScores: Object.fromEntries(
        Object.entries(progress).map(([id, p]) => [id, p.score])
      ),
      totalAttempts: history.length,
      perfectScores: Object.values(progress).filter((p) => p.score >= 100).length,
      attemptHistory: history.map((h) => ({
        taskId: h.taskId,
        score: h.score,
        timestamp: h.timestamp,
      })),
      maxEcCoverage: maxEc,
      maxBvCoverage: maxBv,
      examsCompleted,
      examAvgScore,
    };
    const newlyUnlocked = checkAndUnlockAchievements(context);
    if (newlyUnlocked.length > 0) {
      window.dispatchEvent(new Event("achievements-updated"));
      for (const id of newlyUnlocked) {
        const ach = allAchievements.find((a) => a.id === id);
        if (ach) {
          toast.custom(() => <AchievementToast achievement={ach} />, { duration: 5000 });
        }
      }
    }

    toast.success(`Проверка завершена! Оценка: ${result.overallScore}%`);
    if (result.overallScore >= 90) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    }
  }, [selectedTask, testCases]);

  const handleReset = useCallback(() => {
    setTestCases([]);
    setEvaluationResult(null);
    setActiveTab("trainer");
    // Clear session from localStorage
    if (selectedTask) {
      saveCurrentSession(selectedTask.id, []);
    }
    undoStack.clear();
  }, [selectedTask, undoStack]);

  // Helper: parse input string to typed value
  const parseInputForRef = useCallback((v: string) => {
    const trimmed = v.trim();
    if (trimmed === "true" || trimmed === "да" || trimmed === "верно") return true;
    if (trimmed === "false" || trimmed === "нет" || trimmed === "неверно") return false;
    if (trimmed === "null") return null;
    const num = Number(trimmed);
    if (trimmed !== "" && !isNaN(num) && /^-?\d+(\.\d+)?$/.test(trimmed)) return num;
    try { const p = JSON.parse(trimmed); if (typeof p === "object") return p; } catch {}
    return trimmed;
  }, []);

  // Helper: generate a test case from an EC
  const generateTestCaseFromEc = useCallback((ec: { id: string; name: string; description: string; exampleValues: unknown[] }) => {
    if (!selectedTask || ec.exampleValues.length === 0) return null;
    const exampleValue = ec.exampleValues[0];
    const inputs = Array.isArray(exampleValue)
      ? exampleValue.map(String)
      : [String(exampleValue)];
    const parsedInputs = inputs.map(parseInputForRef);
    const { result: fnResult, error: fnError } = runReferenceFunction(selectedTask.id, parsedInputs);
    let expectedOutput = fnError ? `Ошибка: ${fnError}` : (typeof fnResult === "object" ? JSON.stringify(fnResult) : String(fnResult));
    let category: TestCaseCategory = "Нормальное значение";
    const desc = ec.description.toLowerCase();
    if (desc.includes("ошибк") || desc.includes("недопустим") || desc.includes("переполнен") || desc.includes("неверный")) {
      category = fnError ? "Исключение" : "Нормальное значение";
    }
    if (desc.includes("границ") || desc.includes("миним") || desc.includes("максим")) {
      category = "Граничное значение";
    }
    return {
      id: `tc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      inputs,
      expectedOutput,
      category,
      comment: `Подсказка: ${ec.name}`,
    };
  }, [selectedTask, parseInputForRef]);

  const handleShowHint = useCallback(() => {
    if (!selectedTask) return;

    // Run evaluation to find uncovered ECs
    const result = evaluateTestCases(selectedTask, testCases);

    if (result.uncoveredEcIds.length === 0) {
      toast.info("Все классы эквивалентности уже покрыты!");
      return;
    }

    // Pick a random uncovered EC
    const randomEcId = result.uncoveredEcIds[Math.floor(Math.random() * result.uncoveredEcIds.length)];
    const ec = selectedTask.equivalenceClasses.find((e) => e.id === randomEcId);
    if (!ec) return;

    const newCase = generateTestCaseFromEc(ec);
    if (!newCase) return;

    pushUndoSnapshot();

    setTestCases((prev) => {
      const updated = [...prev, newCase];
      if (selectedTask) {
        saveCurrentSession(selectedTask.id, updated);
      }
      return updated;
    });

    toast.success(`Подсказка: добавлен тест для «${ec.name}»`);
  }, [selectedTask, testCases, generateTestCaseFromEc, pushUndoSnapshot]);

  const handleFillAllEc = useCallback(() => {
    if (!selectedTask) return;

    const result = evaluateTestCases(selectedTask, testCases);
    const uncoveredIds = result.uncoveredEcIds;

    if (uncoveredIds.length === 0) {
      toast.info("Все классы эквивалентности уже покрыты!");
      return;
    }

    const newCases: TestCase[] = [];
    for (const ecId of uncoveredIds) {
      const ec = selectedTask.equivalenceClasses.find((e) => e.id === ecId);
      if (!ec) continue;
      const tc = generateTestCaseFromEc(ec);
      if (tc) newCases.push(tc);
    }

    if (newCases.length === 0) {
      toast.warning("Не удалось сгенерировать тест-кейсы");
      return;
    }

    pushUndoSnapshot();

    setTestCases((prev) => {
      const updated = [...prev, ...newCases];
      if (selectedTask) {
        saveCurrentSession(selectedTask.id, updated);
      }
      return updated;
    });

    toast.success(`Добавлено ${newCases.length} тест-кейс(ов) для покрытия всех EC`);
  }, [selectedTask, testCases, generateTestCaseFromEc, pushUndoSnapshot]);

  const handleResetAllProgress = useCallback(() => {
    clearAllProgress();
    setSavedProgress({});
    setTestCases([]);
    setEvaluationResult(null);
    setSelectedTask(null);
    setActiveTab("tasks");
    setStreak({ currentStreak: 0, longestStreak: 0, lastActiveDate: "" });
    setAttemptHistory([]);
    undoStack.clear();
    setResetDialogOpen(false);
    toast.success("Весь прогресс сброшен");
  }, [undoStack]);

  const handleExportProgress = useCallback(() => {
    const json = exportAllProgress();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-trainer-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Прогресс экспортирован");
  }, []);

  const handleImportProgress = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        if (importAllProgress(text)) {
          setSavedProgress(loadProgress());
          setStreak(loadStreak());
          setAttemptHistory(loadAttemptHistory());
          toast.success("Прогресс импортирован");
        } else {
          toast.error("Не удалось импортировать прогресс");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  const handleBackToTasks = useCallback(() => {
    setActiveTab("tasks");
  }, []);

  // Keyboard shortcuts: Ctrl+Enter to submit, ? for shortcuts, Ctrl+Z/Ctrl+Shift+Z for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (activeTab === "trainer" && selectedTask && testCases.length > 0) {
          handleSubmit();
        }
      }
      // Feature 4: Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "Z" || e.key === "z" || e.key === "Я" || e.key === "я")) {
        e.preventDefault();
        handleRedo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "Z" || e.key === "z" || e.key === "Я" || e.key === "я")) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        setShowShortcuts(true);
      }
      // Quick task selection with number keys
      if (activeTab === "tasks" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

        const num = parseInt(e.key);
        if (num >= 1 && num <= tasks.length) {
          e.preventDefault();
          const task = tasks.find((t) => t.id === num);
          if (task) {
            handleSelectTask(task);
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, selectedTask, testCases, handleSubmit, handleUndo, handleRedo, handleSelectTask]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950/20">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                <Beaker className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Тренажёр тестирования
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Генератор тест-кейсов • Методы чёрного ящика
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Streak display in header */}
              {streak.currentStreak > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 mr-1">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs font-bold text-orange-700 dark:text-orange-400">
                    {streak.currentStreak}
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                onClick={() => setShowShortcuts(true)}
                title="Горячие клавиши"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 sm:py-6">
        {/* Progress Stats Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-emerald-600" />
              <span className="font-medium">
                Выполнено: {completedCount} из {TOTAL_TASKS} заданий
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleExportProgress}
                title="Экспортировать прогресс"
              >
                <Download className="h-3 w-3 mr-1" />
                Экспорт
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleImportProgress}
                title="Импортировать прогресс"
              >
                <Upload className="h-3 w-3 mr-1" />
                Импорт
              </Button>
              {/* Feature 5: Reset Confirmation Dialog */}
              <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-destructive"
                    title="Сбросить весь прогресс"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Сбросить
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Весь прогресс будет безвозвратно удалён.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleResetAllProgress}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Удалить всё
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${(completedCount / TOTAL_TASKS) * 100}%`,
                background:
                  completedCount >= 5
                    ? "linear-gradient(to right, #10b981, #059669)"
                    : completedCount >= 3
                      ? "linear-gradient(to right, #f59e0b, #10b981)"
                      : "linear-gradient(to right, #ef4444, #f59e0b)",
              }}
            />
          </div>
          {/* Best scores for completed tasks */}
          {completedCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.entries(savedProgress).map(([taskId, progress]) => {
                const task = tasks.find((t) => t.id === Number(taskId));
                if (!task) return null;
                return (
                  <span
                    key={taskId}
                    className="text-[10px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                  >
                    {task.name}: {progress.score}%
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap sm:grid sm:grid-cols-6 w-full mb-4 sm:mb-6 h-auto p-1 bg-muted/50 gap-1">
            <TabsTrigger
              value="tasks"
              className="text-xs sm:text-sm py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <ListChecks className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline sm:inline">Задания</span>
              <span className="xs:hidden sm:hidden">Зад</span>
            </TabsTrigger>
            <TabsTrigger
              value="trainer"
              className="text-xs sm:text-sm py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              disabled={!selectedTask}
            >
              <Dumbbell className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline sm:inline">Тренажёр</span>
              <span className="xs:hidden sm:hidden">Тр</span>
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="text-xs sm:text-sm py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              disabled={!evaluationResult}
            >
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline sm:inline">Результаты</span>
              <span className="xs:hidden sm:hidden">Рез</span>
            </TabsTrigger>
            <TabsTrigger
              value="statistics"
              className="text-xs sm:text-sm py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline sm:inline">Статистика</span>
              <span className="xs:hidden sm:hidden">Ст</span>
            </TabsTrigger>
            <TabsTrigger
              value="exam"
              className="text-xs sm:text-sm py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Timer className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline sm:inline">Экзамен</span>
              <span className="xs:hidden sm:hidden">Эк</span>
            </TabsTrigger>
            <TabsTrigger
              value="theory"
              className="text-xs sm:text-sm py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline sm:inline">Теория</span>
              <span className="xs:hidden sm:hidden">Т</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {activeTab === "tasks" && (
              <motion.div
                key="tasks"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-1">
                    Выберите задание
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Выберите функцию для тестирования. Каждое задание содержит
                    описание, классы эквивалентности и граничные значения.
                  </p>
                </div>

                {/* Feature 1: Search Input */}
                <div className="mb-4">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск по названию или описанию..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Feature 2: Filter and Sort Controls */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {/* Difficulty filter */}
                  <div className="flex items-center gap-1">
                    {(["Все", "Легко", "Средне", "Сложно"] as const).map((d) => (
                      <Button
                        key={d}
                        variant={difficultyFilter === d ? "default" : "outline"}
                        size="sm"
                        className={`text-xs h-7 px-2.5 ${difficultyFilter === d ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                        onClick={() => setDifficultyFilter(d)}
                      >
                        {d}
                      </Button>
                    ))}
                  </div>

                  <div className="h-5 w-px bg-border" />

                  {/* Sort */}
                  <div className="flex items-center gap-1">
                    {(["По номеру", "По имени", "По сложности"] as const).map((s) => (
                      <Button
                        key={s}
                        variant={sortMode === s ? "default" : "outline"}
                        size="sm"
                        className={`text-xs h-7 px-2.5 ${sortMode === s ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                        onClick={() => setSortMode(s)}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>

                  <div className="text-xs text-muted-foreground ml-auto">
                    {filteredTasks.length}/{tasks.length} заданий
                  </div>
                </div>

                {/* Feature 1: "Nothing found" message */}
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-16">
                    <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">Ничего не найдено</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Попробуйте изменить поисковый запрос или фильтры
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {filteredTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isSelected={selectedTask?.id === task.id}
                        bestScore={savedProgress[task.id]?.score}
                        bestEcCoverage={taskBestCoverage[task.id]?.bestEc}
                        bestBvCoverage={taskBestCoverage[task.id]?.bestBv}
                        onClick={() => handleSelectTask(task)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "trainer" && selectedTask && (
              <motion.div
                key="trainer"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToTasks}
                    className="text-muted-foreground"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Назад
                  </Button>
                  <h2 className="text-lg sm:text-xl font-semibold">
                    Тренажёр: {selectedTask.name}
                  </h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left panel - task description */}
                  <div className="lg:max-h-[calc(100vh-240px)]">
                    <TaskWorkspace task={selectedTask} />
                  </div>
                  {/* Right panel - test form and list */}
                  <div className="space-y-4">
                    <TestForm
                      task={selectedTask}
                      onAdd={handleAddTestCase}
                    />
                    <TestList
                      task={selectedTask}
                      testCases={testCases}
                      onRemove={handleRemoveTestCase}
                      onDuplicate={handleDuplicateTestCase}
                      onEdit={handleEditTestCase}
                      onSubmit={handleSubmit}
                      onShowHint={handleShowHint}
                      onFillAllEc={handleFillAllEc}
                      onReorder={handleReorderTestCases}
                      onBulkRemove={handleBulkRemove}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "results" && evaluationResult && (
              <motion.div
                key="results"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-1">
                    Результаты проверки
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Подробная оценка ваших тест-кейсов с покрытием и рекомендациями.
                  </p>
                </div>
                <div className="max-w-4xl mx-auto">
                  <ResultsPanel
                    result={evaluationResult}
                    onReset={handleReset}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "theory" && (
              <motion.div
                key="theory"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-1">
                    Теория тестирования
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Изучите основные методы тестирования «чёрного ящика»
                    перед выполнением заданий.
                  </p>
                </div>
                <div className="max-w-3xl mx-auto">
                  <TheoryPanel task={selectedTask} />
                </div>
              </motion.div>
            )}

            {activeTab === "statistics" && (
              <motion.div
                key="statistics"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-1">
                    Статистика и достижения
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Обзор результатов и полученные достижения.
                  </p>
                </div>
                <div className="max-w-3xl mx-auto space-y-6">
                  <StatisticsPanel attempts={attemptHistory} />
                  <AchievementsPanel />
                </div>
              </motion.div>
            )}

            {activeTab === "exam" && (
              <motion.div
                key="exam"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-1">
                    Режим экзамена
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Пройдите задания на время без подсказок.
                  </p>
                </div>
                <ExamMode />
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-zinc-900/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          Тренажёр тестирования • Генератор тест-кейсов • Методы чёрного ящика
        </div>
      </footer>

      <KeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />
      <Confetti active={showConfetti} />
      <Onboarding />
    </div>
  );
}
