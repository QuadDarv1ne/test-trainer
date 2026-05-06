"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { tasks } from "@/lib/tasks";
import type { Task, TestCaseCategory } from "@/lib/tasks";
import type { TestCase, EvaluationResult } from "@/lib/evaluator";
import { evaluateTestCases } from "@/lib/evaluator";
import {
  saveProgress,
  loadProgress,
  saveCurrentSession,
  loadCurrentSession,
  type TaskProgress,
} from "@/lib/storage";
import { TaskCard } from "@/components/task-card";
import { TaskWorkspace } from "@/components/task-workspace";
import { TestForm } from "@/components/test-form";
import { TestList } from "@/components/test-list";
import { ResultsPanel } from "@/components/results-panel";
import { TheoryPanel } from "@/components/theory-panel";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

const TOTAL_TASKS = 6;

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

let nextTestCaseId = 1;

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
  const [savedProgress, setSavedProgress] = useState<Record<number, TaskProgress>>({});

  // Load saved progress on mount
  useEffect(() => {
    setSavedProgress(loadProgress());
  }, []);

  const completedCount = useMemo(() => {
    return Object.keys(savedProgress).length;
  }, [savedProgress]);

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
    },
    []
  );

  const handleAddTestCase = useCallback(
    (
      inputs: string[],
      expected: string,
      category: TestCaseCategory,
      comment: string
    ) => {
      const newCase: TestCase = {
        id: `tc-${nextTestCaseId++}`,
        inputs,
        expectedOutput: expected,
        category,
        comment,
      };
      setTestCases((prev) => {
        const updated = [...prev, newCase];
        // Save to localStorage
        if (selectedTask) {
          saveCurrentSession(selectedTask.id, updated);
        }
        return updated;
      });
      toast.success("Тест-кейс добавлен");
    },
    [selectedTask]
  );

  const handleRemoveTestCase = useCallback(
    (id: string) => {
      setTestCases((prev) => {
        const updated = prev.filter((tc) => tc.id !== id);
        // Save to localStorage
        if (selectedTask) {
          saveCurrentSession(selectedTask.id, updated);
        }
        return updated;
      });
      toast.info("Тест-кейс удалён");
    },
    [selectedTask]
  );

  const handleSubmit = useCallback(() => {
    if (!selectedTask || testCases.length === 0) return;
    const result = evaluateTestCases(selectedTask, testCases);
    setEvaluationResult(result);
    setActiveTab("results");

    // Save best progress
    saveProgress(selectedTask.id, result.overallScore, testCases);
    setSavedProgress(loadProgress());

    toast.success(`Проверка завершена! Оценка: ${result.overallScore}%`);
  }, [selectedTask, testCases]);

  const handleReset = useCallback(() => {
    setTestCases([]);
    setEvaluationResult(null);
    setActiveTab("trainer");
  }, []);

  const handleBackToTasks = useCallback(() => {
    setActiveTab("tasks");
  }, []);

  // Keyboard shortcut: Ctrl+Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (activeTab === "trainer" && selectedTask && testCases.length > 0) {
          handleSubmit();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, selectedTask, testCases, handleSubmit]);

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
            <ThemeToggle />
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
            <span className="text-xs text-muted-foreground">
              {Math.round((completedCount / TOTAL_TASKS) * 100)}%
            </span>
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
          <TabsList className="grid w-full grid-cols-4 mb-4 sm:mb-6 h-auto p-1 bg-muted/50">
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
              value="theory"
              className="text-xs sm:text-sm py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline sm:inline">Теория</span>
              <span className="xs:hidden sm:hidden">Т</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {/* Tasks tab */}
            <TabsContent value="tasks" forceMount>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isSelected={selectedTask?.id === task.id}
                        bestScore={savedProgress[task.id]?.score}
                        onClick={() => handleSelectTask(task)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </TabsContent>

            {/* Trainer tab */}
            <TabsContent value="trainer" forceMount>
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
                        testCases={testCases}
                        onRemove={handleRemoveTestCase}
                        onSubmit={handleSubmit}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </TabsContent>

            {/* Results tab */}
            <TabsContent value="results" forceMount>
              {activeTab === "results" && (
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
            </TabsContent>

            {/* Theory tab */}
            <TabsContent value="theory" forceMount>
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
                    <TheoryPanel />
                  </div>
                </motion.div>
              )}
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-zinc-900/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          Тренажёр тестирования • Генератор тест-кейсов • Методы чёрного ящика
        </div>
      </footer>
    </div>
  );
}
