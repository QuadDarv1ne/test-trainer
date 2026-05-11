"use client";

import { motion } from "framer-motion";
import { TabsContent } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { useLocale } from "@/lib/i18n.client";
import { tasks } from "@/lib/tasks";
import { TaskCard } from "@/components/task-card";

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export function TasksTab() {
  const { t } = useLocale();
  const savedProgress = useAppStore((s) => s.savedProgress);

  return (
    <TabsContent key="tasks" value="tasks">
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-1">{t("tasks_title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("tasks_subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              bestScore={savedProgress[task.id]?.score}
            />
          ))}
        </div>
      </motion.div>
    </TabsContent>
  );
}
