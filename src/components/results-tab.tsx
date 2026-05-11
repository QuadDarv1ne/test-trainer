"use client";

import { motion } from "framer-motion";
import { TabsContent } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { useLocale } from "@/lib/i18n.client";
import { ResultsPanel } from "@/components/results-panel";

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export function ResultsTab() {
  const { t } = useLocale();
  const evaluationResult = useAppStore((s) => s.evaluationResult);

  if (!evaluationResult) return null;

  return (
    <TabsContent key="results" value="results">
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-1">{t("results_title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("results_subtitle")}
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <ResultsPanel />
        </div>
      </motion.div>
    </TabsContent>
  );
}
