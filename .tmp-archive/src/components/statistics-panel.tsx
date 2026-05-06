"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
  Flame,
} from "lucide-react";
import { tasks } from "@/lib/tasks";
import type { AttemptRecord, StreakData } from "@/lib/storage";
import { getTaskHistory, loadStreak } from "@/lib/storage";

interface StatisticsPanelProps {
  attempts: AttemptRecord[];
}

export function StatisticsPanel({ attempts }: StatisticsPanelProps) {
  const [streak] = useState<StreakData>(() => loadStreak());

  const taskStats = tasks.map((task) => {
    const history = getTaskHistory(task.id);
    const bestScore = history.reduce((max, r) => Math.max(max, r.score), 0);
    const avgScore = history.length > 0
      ? Math.round(history.reduce((sum, r) => sum + r.score, 0) / history.length)
      : 0;
    const attemptsCount = history.length;
    const trend = history.length >= 2
      ? history[history.length - 1].score - history[history.length - 2].score
      : 0;

    return { task, bestScore, avgScore, attempts: attemptsCount, trend };
  });

  const totalAttempts = attempts.length;
  const avgOverallScore = totalAttempts > 0
    ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / totalAttempts)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Summary */}
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold flex items-center justify-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              Статистика
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
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
              <span className="text-xs text-orange-600 dark:text-orange-500">
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
                {taskStats.filter((t) => t.bestScore >= 90).length}/{tasks.length}
              </p>
              <p className="text-xs text-muted-foreground">Отлично</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-task stats */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Target className="h-4 w-4" />
          Детализация по заданиям
        </h3>
        {taskStats.map(({ task, bestScore, avgScore, attempts: count, trend }) => {
          const sparklineData = getTaskHistory(task.id).map((h) => h.score);
          return (
          <Card key={task.id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{task.name}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {task.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {trend !== 0 && (
                    <span className={`text-[10px] font-medium ${trend > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {trend > 0 ? "↑" : "↓"}{Math.abs(trend)}%
                    </span>
                  )}
                  {bestScore > 0 && (
                    <Badge className="bg-amber-100 text-amber-800 text-[10px] dark:bg-amber-900/30 dark:text-amber-400">
                      {bestScore}%
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Progress value={bestScore} className="h-1.5 flex-1" />
                <span>{count} попыт{count === 1 ? "ка" : count >= 2 && count <= 4 ? "ки" : "ок"}</span>
                {avgScore > 0 && <span>Ср: {avgScore}%</span>}
              </div>
              {sparklineData.length >= 2 && (
                <div className="flex items-end gap-px h-4 mt-1.5">
                  {sparklineData.slice(-8).map((score, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm min-w-[3px]"
                      style={{
                        height: `${Math.max(2, (score / 100) * 16)}px`,
                        backgroundColor:
                          score >= 90
                            ? "#10b981"
                            : score >= 60
                              ? "#f59e0b"
                              : "#ef4444",
                        opacity: i === sparklineData.slice(-8).length - 1 ? 1 : 0.5 + (i / sparklineData.slice(-8).length) * 0.5,
                      }}
                      title={`Попытка: ${score}%`}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          );
        })}
      </div>

      {totalAttempts === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Пока нет попыток. Начните с первого задания!
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
