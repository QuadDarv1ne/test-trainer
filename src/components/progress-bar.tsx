"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { useLocale } from "@/lib/i18n.client";
import { tasks } from "@/lib/tasks";
import { Trophy } from "lucide-react";

const TOTAL_TASKS = 6;

export function ProgressBar() {
  const { t } = useLocale();
  const savedProgress = useAppStore((s) => s.savedProgress);

  const completedCount = useMemo(() => {
    return Object.keys(savedProgress).length;
  }, [savedProgress]);

  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm">
          <Trophy className="h-4 w-4 text-emerald-600" />
          <span className="font-medium">
            {t("progress_completed")}: {completedCount} {t("progress_of")} {TOTAL_TASKS}
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
  );
}
