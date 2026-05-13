"use client";

import { useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { AppHeader } from "@/components/app-header";
import { ProgressBar } from "@/components/progress-bar";
import { TabNavigation } from "@/components/tab-navigation";
import { TasksTab } from "@/components/tasks-tab";
import { TrainerTab } from "@/components/trainer-tab";
import { ResultsTab } from "@/components/results-tab";
import { TheoryTab } from "@/components/theory-tab";
import { StatisticsPanel } from "@/components/statistics-panel";
import { AchievementsPanel } from "@/components/achievements-panel";
import { ExamMode } from "@/components/exam-mode";
import { AppFooter } from "@/components/app-footer";

export default function Home() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const loadProgress = useAppStore((s) => s.loadProgress);
  const submitTestCases = useAppStore((s) => s.submitTestCases);
  const clearTestCases = useAppStore((s) => s.clearTestCases);
  const setEvaluationResult = useAppStore((s) => s.setEvaluationResult);
  const testCases = useAppStore((s) => s.testCases);

  // Load saved progress on mount
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (activeTab === "trainer") {
          const result = submitTestCases();
          if (result) {
            setActiveTab("results");
          }
        }
      }
      // Ctrl+Z to remove last test case
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        if (activeTab === "trainer" && testCases.length > 0) {
          e.preventDefault();
          const lastCase = testCases[testCases.length - 1];
          useAppStore.getState().removeTestCase(lastCase.id);
        }
      }
      // Escape to reset
      if (e.key === "Escape") {
        if (activeTab === "trainer" && testCases.length > 0) {
          e.preventDefault();
          clearTestCases();
          setEvaluationResult(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, testCases, submitTestCases, clearTestCases, setEvaluationResult, setActiveTab]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950/20">
      <AppHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 sm:py-6">
        <ProgressBar />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabNavigation />

          <TasksTab key="tasks" />
          <TrainerTab key="trainer" />
          <ResultsTab key="results" />
          <TheoryTab key="theory" />
          <TabsContent key="statistics" value="statistics">
            <StatisticsPanel />
          </TabsContent>
          <TabsContent key="achievements" value="achievements">
            <AchievementsPanel />
          </TabsContent>
          <TabsContent key="exam" value="exam">
            <ExamMode />
          </TabsContent>
        </Tabs>
      </main>

      <AppFooter />
    </div>
  );
}
