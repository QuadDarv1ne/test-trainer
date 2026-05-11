"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { useLocale } from "@/lib/i18n.client";
import { ListChecks, Dumbbell, BarChart3, BookOpen, Trophy } from "lucide-react";

export function TabNavigation() {
  const { t } = useLocale();
  const selectedTask = useAppStore((s) => s.selectedTask);
  const evaluationResult = useAppStore((s) => s.evaluationResult);

  return (
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
  );
}
