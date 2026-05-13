"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/lib/tasks";
import {
  Trophy,
  FunctionSquare,
  Hash,
  DollarSign,
  Calendar,
  Triangle,
  Lock,
  CaseSensitive,
  CalendarCheck,
  ArrowUpDown,
  Mail,
} from "lucide-react";
import { useLocale } from "@/lib/i18n.client";
import { useAppStore } from "@/lib/store";
import ReactMarkdown from "react-markdown";

const taskIcons: Record<number, React.ReactNode> = {
  1: <FunctionSquare className="h-5 w-5" />,
  2: <Hash className="h-5 w-5" />,
  3: <DollarSign className="h-5 w-5" />,
  4: <Calendar className="h-5 w-5" />,
  5: <Triangle className="h-5 w-5" />,
  6: <Lock className="h-5 w-5" />,
  7: <CaseSensitive className="h-5 w-5" />,
  8: <CalendarCheck className="h-5 w-5" />,
  9: <ArrowUpDown className="h-5 w-5" />,
  10: <Mail className="h-5 w-5" />,
};

interface TaskCardProps {
  task: Task;
  isSelected?: boolean;
  bestScore?: number;
  onClick?: () => void;
}

export function TaskCard({ task, isSelected: isSelectedProp, bestScore, onClick }: TaskCardProps) {
  const { t } = useLocale();
  const selectedTask = useAppStore((s) => s.selectedTask);
  const setSelectedTask = useAppStore((s) => s.setSelectedTask);

  const isSelected = isSelectedProp ?? selectedTask?.id === task.id;
  const handleClick = onClick ?? (() => setSelectedTask(task));

  const difficultyLabel =
    task.difficulty === "Легко"
      ? t("difficulty_easy")
      : task.difficulty === "Средне"
        ? t("difficulty_medium")
        : t("difficulty_hard");

  const difficultyColor =
    task.difficulty === "Легко"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
      : task.difficulty === "Средне"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
        : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400";

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card
        className={`cursor-pointer transition-all duration-200 h-full ${
          isSelected
            ? "ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20"
            : "hover:shadow-md hover:ring-1 hover:ring-emerald-300"
        }`}
        onClick={handleClick}
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
                className={difficultyColor}
              >
                {difficultyLabel}
              </Badge>
              {bestScore !== undefined && bestScore > 0 && (
                <Badge className="bg-amber-100 text-amber-800 text-[10px] dark:bg-amber-900/30 dark:text-amber-400">
                  <Trophy className="h-3 w-3 mr-0.5" />
                  {bestScore}%
                </Badge>
              )}
            </div>
          </div>

          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{children}</p>
              ),
              code: ({ children }) => (
                <code className="bg-muted px-1 py-0.5 rounded text-[10px] font-mono">{children}</code>
              ),
              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
              ul: () => null, // Skip lists in card view
              ol: () => null,
              li: () => null,
            }}
          >
            {task.description}
          </ReactMarkdown>

          <div className="flex flex-wrap gap-1">
            {task.topics.map((topic) => {
              // Map Russian topic names to i18n keys
              const topicTranslation =
                topic === "Классы эквивалентности"
                  ? t("topic_ec")
                  : topic === "Граничные значения"
                    ? t("topic_bv")
                    : topic === "Нелинейные классы"
                      ? t("topic_nonlinear")
                      : topic === "Многофакторное тестирование"
                        ? t("topic_multi")
                        : topic === "Логические условия"
                          ? t("topic_logic")
                          : topic === "Комбинаторное тестирование"
                            ? t("topic_combinatorial")
                            : topic === "Проверка форматов"
                              ? t("topic_formats")
                              : topic === "Таблицы решений"
                                ? t("topic_decision_tables")
                                : topic;
              return (
                <Badge
                  key={topic}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0"
                >
                  {topicTranslation}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
