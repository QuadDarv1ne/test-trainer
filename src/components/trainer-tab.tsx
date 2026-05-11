"use client";

import { motion } from "framer-motion";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { useLocale } from "@/lib/i18n.client";
import type { TestCaseCategory } from "@/lib/tasks";
import type { TestCase } from "@/lib/evaluator";
import { TaskWorkspace } from "@/components/task-workspace";
import { TestForm } from "@/components/test-form";
import { TestList } from "@/components/test-list";
import { ArrowLeft } from "lucide-react";
import { pageVariants } from "@/lib/animations";

export function TrainerTab() {
  const { t } = useLocale();
  const selectedTask = useAppStore((s) => s.selectedTask);
  const testCases = useAppStore((s) => s.testCases);
  const savedProgress = useAppStore((s) => s.savedProgress);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const addTestCase = useAppStore((s) => s.addTestCase);
  const removeTestCase = useAppStore((s) => s.removeTestCase);
  const reorderTestCases = useAppStore((s) => s.reorderTestCases);
  const submitTestCases = useAppStore((s) => s.submitTestCases);

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
    const result = submitTestCases();
    if (result) {
      setActiveTab("results");
      toast.success(t("toast_check_done").replace("{score}", String(result.overallScore)));
    }
  };

  return (
    <TabsContent key="trainer" value="trainer">
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
        {selectedTask ? (
          <>
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("tasks")} className="text-muted-foreground">
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
              <div className="lg:max-h-[calc(100vh-240px)]">
                <TaskWorkspace task={selectedTask} testCasesCount={testCases.length} />
              </div>
              <div className="space-y-4">
                <TestForm task={selectedTask} onAdd={handleAddTestCase} />
                <TestList
                  testCases={testCases}
                  onRemove={removeTestCase}
                  onSubmit={handleSubmit}
                  onReorder={reorderTestCases}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>{t("trainer_select_task")}</p>
          </div>
        )}
      </motion.div>
    </TabsContent>
  );
}
