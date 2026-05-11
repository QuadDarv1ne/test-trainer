"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  BookOpen,
  Layers,
  GitBranch,
  ArrowRightLeft,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";
import { useLocale } from "@/lib/i18n.client";

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export function TheoryPanel() {
  const { t } = useLocale();

  return (
    <motion.div {...fadeIn} className="space-y-4">
      {/* Introduction */}
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t("theory_title")}</h2>
              <p className="text-xs text-muted-foreground">
                {t("theory_subtitle")}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("theory_intro")}
          </p>
        </CardContent>
      </Card>

      <Accordion type="multiple" className="space-y-3">
        {/* Equivalence Classes */}
        <AccordionItem
          value="ec"
          className="border rounded-lg px-4 data-[state=open]:border-emerald-300 data-[state=open]:bg-emerald-50/50 dark:data-[state=open]:border-emerald-800 dark:data-[state=open]:bg-emerald-950/20"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400">
                <Layers className="h-4 w-4" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">{t("theory_ec_title")}</h3>
                <p className="text-xs text-muted-foreground">
                  {t("theory_ec_subtitle")}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong>{t("theory_ec_title")}</strong> — {t("theory_ec_types").toLowerCase()}.
              </p>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <p className="font-medium text-foreground text-xs uppercase tracking-wider">
                  {t("theory_ec_types")}
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">●</span>
                    <span>
                      <strong>{t("theory_ec_valid")}</strong> — {t("theory_ec_valid_desc")}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 mt-0.5">●</span>
                    <span>
                      <strong>{t("theory_ec_invalid")}</strong> — {t("theory_ec_invalid_desc")}
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                <p className="font-medium text-emerald-800 dark:text-emerald-300 text-xs mb-1 flex items-center gap-1">
                  <Lightbulb className="h-3.5 w-3.5" />
                  {t("theory_ec_example")}
                </p>
                <p className="text-xs">
                  {t("theory_ec_example_text")}
                </p>
                <ul className="mt-1 space-y-0.5 text-xs">
                  <li>• {t("theory_ec_example_list1")}</li>
                  <li>• {t("theory_ec_example_list2")}</li>
                  <li>• {t("theory_ec_example_list3")}</li>
                  <li>• {t("theory_ec_example_list4")}</li>
                  <li>• {t("theory_ec_example_list5")}</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Boundary Values */}
        <AccordionItem
          value="bv"
          className="border rounded-lg px-4 data-[state=open]:border-amber-300 data-[state=open]:bg-amber-50/50 dark:data-[state=open]:border-amber-800 dark:data-[state=open]:bg-amber-950/20"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                <GitBranch className="h-4 w-4" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">{t("theory_bv_title")}</h3>
                <p className="text-xs text-muted-foreground">
                  {t("theory_bv_subtitle")}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong>{t("theory_bv_title")}</strong> — {t("theory_bv_rules").toLowerCase()}.
              </p>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <p className="font-medium text-foreground text-xs uppercase tracking-wider">
                  {t("theory_bv_rules")}
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">●</span>
                    <span>{t("theory_bv_rule1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">●</span>
                    <span>{t("theory_bv_rule2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">●</span>
                    <span>{t("theory_bv_rule3")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">●</span>
                    <span>{t("theory_bv_rule4")}</span>
                  </li>
                </ul>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                <p className="font-medium text-amber-800 dark:text-amber-300 text-xs mb-1 flex items-center gap-1">
                  <Lightbulb className="h-3.5 w-3.5" />
                  {t("theory_ec_example")}
                </p>
                <p className="text-xs">
                  {t("theory_bv_example_text")}
                </p>
                <div className="flex gap-2 mt-1 text-xs flex-wrap">
                  <code className="bg-white dark:bg-muted px-1.5 py-0.5 rounded font-mono border border-rose-200 dark:border-rose-800 text-rose-700">0 ({t("theory_bv_below_min")})</code>
                  <code className="bg-white dark:bg-muted px-1.5 py-0.5 rounded font-mono border border-emerald-200 dark:border-emerald-800 text-emerald-700">1 ({t("theory_bv_min")})</code>
                  <code className="bg-white dark:bg-muted px-1.5 py-0.5 rounded font-mono border border-emerald-200 dark:border-emerald-800 text-emerald-700">2 ({t("theory_bv_min_plus")})</code>
                  <code className="bg-white dark:bg-muted px-1.5 py-0.5 rounded font-mono border border-emerald-200 dark:border-emerald-800 text-emerald-700">9 ({t("theory_bv_max_minus")})</code>
                  <code className="bg-white dark:bg-muted px-1.5 py-0.5 rounded font-mono border border-emerald-200 dark:border-emerald-800 text-emerald-700">10 ({t("theory_bv_max")})</code>
                  <code className="bg-white dark:bg-muted px-1.5 py-0.5 rounded font-mono border border-rose-200 dark:border-rose-800 text-rose-700">11 ({t("theory_bv_above_max")})</code>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Test Case Categories */}
        <AccordionItem
          value="categories"
          className="border rounded-lg px-4 data-[state=open]:border-purple-300 data-[state=open]:bg-purple-50/50 dark:data-[state=open]:border-purple-800 dark:data-[state=open]:bg-purple-950/20"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">
                <ArrowRightLeft className="h-4 w-4" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">{t("theory_categories_title")}</h3>
                <p className="text-xs text-muted-foreground">
                  {t("theory_categories_subtitle")}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                  <p className="font-medium text-emerald-800 dark:text-emerald-300 text-xs mb-1">
                    🟢 {t("theory_cat_normal")}
                  </p>
                  <p className="text-xs">
                    {t("theory_cat_normal_desc")}
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                  <p className="font-medium text-amber-800 dark:text-amber-300 text-xs mb-1">
                    🟡 {t("theory_cat_boundary")}
                  </p>
                  <p className="text-xs">
                    {t("theory_cat_boundary_desc")}
                  </p>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-3">
                  <p className="font-medium text-rose-800 dark:text-rose-300 text-xs mb-1">
                    🔴 {t("theory_cat_exception")}
                  </p>
                  <p className="text-xs">
                    {t("theory_cat_exception_desc")}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                  <p className="font-medium text-purple-800 dark:text-purple-300 text-xs mb-1">
                    🟣 {t("theory_cat_invalid")}
                  </p>
                  <p className="text-xs">
                    {t("theory_cat_invalid_desc")}
                  </p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Tips */}
        <AccordionItem
          value="tips"
          className="border rounded-lg px-4 data-[state=open]:border-teal-300 data-[state=open]:bg-teal-50/50 dark:data-[state=open]:border-teal-800 dark:data-[state=open]:bg-teal-950/20"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">{t("theory_tips_title")}</h3>
                <p className="text-xs text-muted-foreground">
                  {t("theory_tips_subtitle")}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">1.</span>
                  <span>
                    <strong>{t("theory_tip1").split("—")[0]}</strong>—{t("theory_tip1").split("—")[1]}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">2.</span>
                  <span>
                    <strong>{t("theory_tip2").split("—")[0]}</strong>—{t("theory_tip2").split("—")[1]}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">3.</span>
                  <span>
                    <strong>{t("theory_tip3").split("—")[0]}</strong>—{t("theory_tip3").split("—")[1]}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">4.</span>
                  <span>
                    <strong>{t("theory_tip4").split("—")[0]}</strong>—{t("theory_tip4").split("—")[1]}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">5.</span>
                  <span>
                    <strong>{t("theory_tip5").split("—")[0]}</strong>—{t("theory_tip5").split("—")[1]}
                  </span>
                </li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
}
