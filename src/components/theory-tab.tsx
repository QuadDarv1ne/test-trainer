"use client";

import { motion } from "framer-motion";
import { TabsContent } from "@/components/ui/tabs";
import { useLocale } from "@/lib/i18n.client";
import { TheoryPanel } from "@/components/theory-panel";
import { pageVariants } from "@/lib/animations";

export function TheoryTab() {
  const { t } = useLocale();

  return (
    <TabsContent key="theory" value="theory">
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-1">{t("theory_title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("theory_subtitle")}
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <TheoryPanel />
        </div>
      </motion.div>
    </TabsContent>
  );
}
