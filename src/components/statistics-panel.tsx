"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { tasks } from "@/lib/tasks";
import type { AttemptRecord, StreakData } from "@/lib/storage";
import { loadStreak, loadAttempts } from "@/lib/storage";

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
