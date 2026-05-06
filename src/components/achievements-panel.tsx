"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  achievements,
  loadUnlockedAchievements,
  type Achievement,
} from "@/lib/achievements";

export function AchievementsPanel() {
  const [unlockedIds, setUnlockedIds] = useState<string[]>(() =>
    loadUnlockedAchievements()
  );
  useEffect(() => {
    const handler = () => {
      setUnlockedIds(loadUnlockedAchievements());
    };
    window.addEventListener("achievements-updated", handler);
    return () => window.removeEventListener("achievements-updated", handler);
  }, []);

  const unlockedCount = unlockedIds.length;
  const totalCount = achievements.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold flex items-center justify-center gap-2">
              🏅 Достижения
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {unlockedCount} из {totalCount} получено
            </p>
          </div>
          {/* Progress bar */}
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%`,
                background: "linear-gradient(to right, #10b981, #059669)",
              }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {achievements.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          return (
            <motion.div
              key={achievement.id}
              whileHover={{ scale: isUnlocked ? 1.02 : 1 }}
              className={`rounded-lg border p-4 transition-all ${
                isUnlocked
                  ? "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/10"
                  : "border-border opacity-60 grayscale"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{achievement.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {achievement.name}
                    </p>
                    {isUnlocked && (
                      <Badge className="bg-amber-100 text-amber-800 text-[9px] dark:bg-amber-900/30 dark:text-amber-400 shrink-0">
                        ✓
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {achievement.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function AchievementToast({ achievement }: { achievement: Achievement }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 shadow-lg"
    >
      <span className="text-3xl">{achievement.icon}</span>
      <div>
        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
          Достижение разблокировано!
        </p>
        <p className="text-sm font-bold">{achievement.name}</p>
      </div>
    </motion.div>
  );
}