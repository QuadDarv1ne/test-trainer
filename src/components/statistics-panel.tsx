"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Trash2 } from "lucide-react";
import { tasks } from "@/lib/tasks";
import type { AttemptRecord, StreakData } from "@/lib/storage";
import { loadStreak, loadAttempts, clearAllProgress } from "@/lib/storage";
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

export function StatisticsPanel() {
  const [streak] = useState<StreakData>(() => loadStreak());
  const attempts = loadAttempts();
  const totalAttempts = attempts.length;
  const avgOverallScore = totalAttempts > 0
    ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / totalAttempts)
    : 0;

  const completedWithExcellent = tasks.filter((t) => {
    const progress = loadProgress();
    const p = progress[t.id];
    return p && p.score >= 90;
  }).length;

  const handleReset = () => {
    clearAllProgress();
    toast.success("Прогресс сброшен");
    // Reload page to refresh state
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold mb-1">Статистика</h2>
        <p className="text-sm text-muted-foreground">
          История ваших попыток и прогресс по заданиям
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
            дн. подряд
          </span>
        </div>
        {streak.longestStreak > 0 && (
          <span className="text-xs text-muted-foreground">
            Рекорд: {streak.longestStreak} дн.
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-emerald-600">{totalAttempts}</p>
          <p className="text-xs text-muted-foreground">Попыток</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-teal-600">{avgOverallScore}%</p>
          <p className="text-xs text-muted-foreground">Средний балл</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-amber-600">
            {completedWithExcellent}/{tasks.length} задач
          </p>
          <p className="text-xs text-muted-foreground">Отлично</p>
        </div>
      </div>

      {/* Reset progress */}
      <div className="flex justify-center pt-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
              <Trash2 className="h-3 w-3" />
              Сбросить прогресс
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Сбросить весь прогресс?</AlertDialogTitle>
              <AlertDialogDescription>
                Это действие удалит все ваши результаты, статистику и достижения.
                Действие нельзя отменить.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>Сбросить</AlertDialogAction>
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
