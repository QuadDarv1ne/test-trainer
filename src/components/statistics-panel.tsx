"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Trash2, Download } from "lucide-react";
import { downloadJSON, downloadCSV } from "@/lib/export";
import { tasks } from "@/lib/tasks";
import { loadStreak, loadAttempts, type StreakData } from "@/lib/storage";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { useLocale } from "@/lib/i18n.client";

export function StatisticsPanel() {
  const { t, locale } = useLocale();
  const [streak] = useState<StreakData>(() => loadStreak());
  const attempts = loadAttempts();
  const totalAttempts = attempts.length;
  const avgOverallScore = totalAttempts > 0
    ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / totalAttempts)
    : 0;

  const progress = loadProgress();
  const completedWithExcellent = tasks.filter((task) => {
    const p = progress[task.id];
    return p && p.score >= 90;
  }).length;

  const handleReset = () => {
    useAppStore.getState().clearAllProgress();
    toast.success(t("toast_progress_reset"));
  };

  const dateLocale = locale === "ru" ? ru : enUS;

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold mb-1">{t("stats_title")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("stats_subtitle")}
        </p>
      </div>

      {/* Streak display */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-bold text-orange-700 dark:text-orange-400">
            {streak.currentStreak}
          </span>
          <span className="text-xs text-orange-600 dark:text-orange-400">
            {t("stats_days_row")}
          </span>
        </div>
        {streak.longestStreak > 0 && (
          <span className="text-xs text-muted-foreground">
            {t("stats_record")}: {streak.longestStreak}
          </span>
        )}
      </div>

      {/* Score progress chart */}
      {attempts.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold mb-3">{t("stats_score_progress")}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={attempts.slice(-20).map((a, i) => ({
                  index: i + 1,
                  score: a.score,
                  date: format(new Date(a.timestamp), "dd MMM HH:mm", { locale: dateLocale }),
                  task: tasks.find((tk) => tk.id === a.taskId)?.name ?? `#${a.taskId}`,
                }))}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="index" className="text-xs" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} className="text-xs" tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, t("results_metric_score")]}
                  labelFormatter={(_, payload) => {
                    const item = payload?.[0]?.payload;
                    return item ? `${item.task} — ${item.date}` : `${t("stats_attempts")} ${_ + 1}`;
                  }}
                  contentStyle={{ fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-emerald-600">{totalAttempts}</p>
          <p className="text-xs text-muted-foreground">{t("stats_attempts")}</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-teal-600">{avgOverallScore}%</p>
          <p className="text-xs text-muted-foreground">{t("stats_avg_score")}</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-amber-600">
            {completedWithExcellent}/{tasks.length} {t("stats_tasks_completed")}
          </p>
          <p className="text-xs text-muted-foreground">{t("stats_excellent")}</p>
        </div>
      </div>

      {/* Export buttons */}
      <div className="flex justify-center gap-2 pt-2">
        <button
          onClick={() => { downloadJSON(); toast.success(t("toast_export_json")); }}
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
        >
          <Download className="h-3 w-3" />
          {t("stats_export_json")}
        </button>
        <button
          onClick={() => { downloadCSV(); toast.success(t("toast_export_csv")); }}
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
        >
          <Download className="h-3 w-3" />
          {t("stats_export_csv")}
        </button>
      </div>

      {/* Reset progress */}
      <div className="flex justify-center pt-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
              <Trash2 className="h-3 w-3" />
              {t("stats_reset")}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("stats_reset_title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("stats_reset_desc")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("stats_reset_cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>{t("stats_reset_confirm")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// Helper to load progress
function loadProgress(): Record<number, { score: number }> {
  try {
    const raw = localStorage.getItem("test-trainer-progress");
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
