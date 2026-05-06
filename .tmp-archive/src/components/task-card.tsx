"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/lib/tasks";
import { Trophy } from "lucide-react";
import {
  FunctionSquare,
  Hash,
  DollarSign,
  Calendar,
  Triangle,
  Lock,
  ArrowLeftRight,
  Mail,
} from "lucide-react";

const taskIcons: Record<number, React.ReactNode> = {
  1: <FunctionSquare className="h-5 w-5" />,
  2: <Hash className="h-5 w-5" />,
  3: <DollarSign className="h-5 w-5" />,
  4: <Calendar className="h-5 w-5" />,
  5: <Triangle className="h-5 w-5" />,
  6: <Lock className="h-5 w-5" />,
  7: <ArrowLeftRight className="h-5 w-5" />,
  8: <Mail className="h-5 w-5" />,
};

const difficultyColors: Record<string, string> = {
  Легко: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  Средне: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Сложно: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
};

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  bestScore?: number;
  bestEcCoverage?: number;
  bestBvCoverage?: number;
  onClick: () => void;
}

export function TaskCard({ task, isSelected, bestScore, bestEcCoverage, bestBvCoverage, onClick }: TaskCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card
        className={`cursor-pointer transition-all duration-200 h-full ${
          isSelected
            ? "ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20"
            : "hover:shadow-md hover:ring-1 hover:ring-emerald-300"
        }`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
        aria-label={`Задание: ${task.name}, сложность: ${task.difficulty}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                {taskIcons[task.id]}
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight">
                  {task.name}
                </h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {task.signature}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge
                variant="secondary"
                className={difficultyColors[task.difficulty]}
              >
                {task.difficulty}
              </Badge>
              {bestScore !== undefined && bestScore > 0 && (
                <Badge className="bg-amber-100 text-amber-800 text-[10px] dark:bg-amber-900/30 dark:text-amber-400">
                  <Trophy className="h-3 w-3 mr-0.5" />
                  {bestScore}%
                </Badge>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            {task.description}
          </p>

          {/* Mini coverage stats */}
          {bestEcCoverage !== undefined && bestEcCoverage > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 font-mono ${
                  bestEcCoverage >= 90
                    ? "border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400"
                    : bestEcCoverage >= 50
                      ? "border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400"
                      : "border-rose-300 text-rose-700 dark:border-rose-700 dark:text-rose-400"
                }`}
              >
                EC: {bestEcCoverage}%
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 font-mono ${
                  bestBvCoverage !== undefined && bestBvCoverage >= 90
                    ? "border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400"
                    : bestBvCoverage !== undefined && bestBvCoverage >= 50
                      ? "border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400"
                      : "border-rose-300 text-rose-700 dark:border-rose-700 dark:text-rose-400"
                }`}
              >
                BV: {bestBvCoverage ?? 0}%
              </Badge>
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {task.topics.map((topic) => (
              <Badge
                key={topic}
                variant="outline"
                className="text-[10px] px-1.5 py-0"
              >
                {topic}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
