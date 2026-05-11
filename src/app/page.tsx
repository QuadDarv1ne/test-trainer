"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tasks } from "@/lib/tasks";
import type { TestCaseCategory } from "@/lib/tasks";
import type { TestCase } from "@/lib/evaluator";
import { evaluateTestCases } from "@/lib/evaluator";
import { useAppStore } from "@/lib/store";
import { TaskCard } from "@/components/task-card";
import { TaskWorkspace } from "@/components/task-workspace";
import { TestForm } from "@/components/test-form";
import { TestList } from "@/components/test-list";
import { ResultsPanel } from "@/components/results-panel";
import { TheoryPanel } from "@/components/theory-panel";
import { StatisticsPanel } from "@/components/statistics-panel";
import { useLocale } from "@/lib/i18n.client";
import { AchievementsPanel } from "@/components/achievements-panel";
import { Beaker, ListChecks, Dumbbell, BarChart3, BookOpen, ArrowLeft, Sun, Moon, Trophy, } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOTAL_TASKS = 6;

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

function LocaleToggle() {
  const { locale, setLocale } = useLocale();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-9 text-xs font-medium text-muted-foreground hover:text-foreground"
      onClick={() => setLocale(locale === "ru" ? "en" : "ru")}
    >
      {locale === "ru" ? "EN" : "RU"}
    </Button>
  );
}

export default function Home() {
  const { t } = useLocale();

  // Store state
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const selectedTask = useAppStore((s) => s.selectedTask);
  const setSelectedTask = useAppStore((s) => s.setSelectedTask);
  const testCases = useAppStore((s) => s.testCases);
  const addTestCase = useAppStore((s) => s.addTestCase);
  const removeTestCase = useAppStore((s) => s.removeTestCase);
  const reorderTestCases = useAppStore((s) => s.reorderTestCases);
  const evaluationResult = useAppStore((s) => s.evaluationResult);
  const setEvaluationResult = useAppStore((s) => s.setEvaluationResult);
  const savedProgress = useAppStore((s) => s.savedProgress);
  const updateProgress = useAppStore((s) => s.updateProgress);
  const loadProgress = useAppStore((s) => s.loadProgress);

  // Load saved progress on mount
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const completedCount = useMemo(() => {
    return Object.keys(savedProgress).length;
  }, [savedProgress]);

  const handleAddTestCase = (
    inputs: string[],
    expected: string,
    category: TestCaseCategory,
    comment: string
  ) => {
    const newCase: TestCase = {
      id: `tc-${crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2)}`,
      inputs,
      expectedOutput: expected,
      category,
      comment,
    };
    addTestCase(newCase);
    toast.success(t("toast_tc_added"));
  };

  const handleSubmit = () => {
    if (!selectedTask || testCases.length === 0) return;
    const result = evaluateTestCases(selectedTask, testCases);
    setEvaluationResult(result);
    setActiveTab("results");
    updateProgress(selectedTask.id, result.overallScore, testCases);
    toast.success(t("toast_check_done").replace("{score}", String(result.overallScore)));
  };

  const clearTestCases = useAppStore((s) => s.clearTestCases);

  const handleReset = () => {
    clearTestCases();
    setEvaluationResult(null);
    setActiveTab("trainer");
  };

  const handleBackToTasks = () => {
    setActiveTab("tasks");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (activeTab === "trainer" && selectedTask && testCases.length > 0) {
          handleSubmit();
        }
      }
      // Ctrl+Z to remove last test case
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        if (activeTab === "trainer" && testCases.length > 0) {
          e.preventDefault();
          const lastCase = testCases[testCases.length - 1];
          removeTestCase(lastCase.id);
        }
      }
      // Escape to reset
      if (e.key === "Escape") {
        if (activeTab === "trainer" && testCases.length > 0) {
          e.preventDefault();
          handleReset();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, selectedTask, testCases, handleSubmit, removeTestCase]);

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
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t("header_title")}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("header_subtitle")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <LocaleToggle />
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
                {" "}{t("progress_completed")}: {completedCount} {t("progress_of")} {TOTAL_TASKS}{" "}
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
          <TabsList className="w-full mb-4 sm:mb-6 h-auto p-1 bg-muted/50 overflow-x-auto flex justify-start gap-1 [&>button]:flex-1 [&>button]:min-w-0">
            <TabsTrigger
              value="tasks"
              className="text-xs sm:text-sm py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <ListChecks className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t("tab_tasks")}</span>
              <span className="sm:hidden">{t("tab_tasks_short")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="trainer"
              className="text-xs sm:text-sm py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              disabled={!selectedTask}
            >
              <Dumbbell className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t("tab_trainer")}</span>
              <span className="sm:hidden">{t("tab_trainer_short")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="text-xs sm:text-sm py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              disabled={!evaluationResult}
            >
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t("tab_results")}</span>
              <span className="sm:hidden">{t("tab_results_short")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="theory"
              className="text-xs sm:text-sm py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t("tab_theory")}</span>
              <span className="sm:hidden">{t("tab_theory_short")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="statistics"
              className="text-xs sm:text-sm py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t("tab_statistics")}</span>
              <span className="sm:hidden">{t("tab_statistics_short")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="text-xs sm:text-sm py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t("tab_achievements")}</span>
              <span className="sm:hidden">{t("tab_achievements_short")}</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {/* Tasks tab */}
            <TabsContent key="tasks" value="tasks">
              <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <div className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold mb-1">{t("tasks_title")}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t("tasks_subtitle")}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        bestScore={savedProgress[task.id]?.score}
                      />
                    ))}
                  </div>
                </motion.div>
              </TabsContent>

            {/* Trainer tab */}
            <TabsContent key="trainer" value="trainer">
              {selectedTask && (
                <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    <Button variant="ghost" size="sm" onClick={handleBackToTasks} className="text-muted-foreground">
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      {t("trainer_back")}
                    </Button>
                    <h2 className="text-lg sm:text-xl font-semibold">{t("trainer_title")}: {selectedTask.name}</h2>
                    {savedProgress[selectedTask.id]?.score !== undefined && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        {t("trainer_best")}: {savedProgress[selectedTask.id].score}%
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Left panel - task description */}
                    <div className="lg:max-h-[calc(100vh-240px)]">
                      <TaskWorkspace task={selectedTask} testCasesCount={testCases.length} />
                    </div>
                    {/* Right panel - test form and list */}
                    <div className="space-y-4">
                      <TestForm task={selectedTask} onAdd={handleAddTestCase} />
                      <TestList testCases={testCases} onRemove={removeTestCase} onSubmit={handleSubmit} onReorder={reorderTestCases} />
                    </div>
                  </div>
                </motion.div>
              )}
            </TabsContent>
            <TabsContent key="results" value="results">
              {evaluationResult && (
                <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold mb-1">{t("results_title")}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t("results_subtitle")}
                    </p>
                  </div>
                  <div className="max-w-4xl mx-auto">
                    <ResultsPanel />
                  </div>
                </motion.div>
              )}
            </TabsContent>

            {/* Theory tab */}
            <TabsContent key="theory" value="theory">
              <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <div className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold mb-1">{t("theory_title")}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t("theory_subtitle")}
                    </p>
                  </div>
                  <div className="max-w-3xl mx-auto">
                    <TheoryPanel />
                  </div>
                </motion.div>
              </TabsContent>
            <TabsContent key="statistics" value="statistics">
              <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <StatisticsPanel />
              </motion.div>
            </TabsContent>
            <TabsContent key="achievements" value="achievements">
              <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <AchievementsPanel />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-zinc-900/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          {t("footer_text")}
        </div>
      </footer>
    </div>
  );
}
