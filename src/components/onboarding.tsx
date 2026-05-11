"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Sparkles,
  ListChecks,
  Dumbbell,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { useLocale } from "@/lib/i18n.client";

const ONBOARDING_KEY = "test-trainer-onboarding-done";

function useOnboardingSteps() {
  const { t } = useLocale();
  return [
    {
      icon: <Sparkles className="h-8 w-8 text-emerald-600" />,
      title: t("onboarding_step1_title"),
      description: t("onboarding_step1_desc"),
    },
    {
      icon: <ListChecks className="h-8 w-8 text-teal-600" />,
      title: t("onboarding_step2_title"),
      description: t("onboarding_step2_desc"),
    },
    {
      icon: <Dumbbell className="h-8 w-8 text-amber-600" />,
      title: t("onboarding_step3_title"),
      description: t("onboarding_step3_desc"),
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      title: t("onboarding_step4_title"),
      description: t("onboarding_step4_desc"),
    },
    {
      icon: <BookOpen className="h-8 w-8 text-blue-600" />,
      title: t("onboarding_step5_title"),
      description: t("onboarding_step5_desc"),
    },
  ];
}

export function Onboarding() {
  const { t } = useLocale();
  const steps = useOnboardingSteps();
  const [open, setOpen] = useState(() => {
    try {
      return !localStorage.getItem(ONBOARDING_KEY);
    } catch {
      return false;
    }
  });
  const [step, setStep] = useState(0);

  const handleClose = () => {
    setOpen(false);
    try {
      localStorage.setItem(ONBOARDING_KEY, "true");
    } catch {
      // ignore
    }
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader>
              <div className="flex justify-center mb-2">{current.icon}</div>
              <DialogTitle className="text-center">{current.title}</DialogTitle>
              <DialogDescription className="text-center text-sm leading-relaxed">
                {current.description}
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center gap-1.5 mt-4 mb-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step
                      ? "w-6 bg-emerald-500"
                      : i < step
                      ? "w-1.5 bg-emerald-300 dark:bg-emerald-700"
                      : "w-1.5 bg-muted"
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="ghost" className="flex-1" onClick={handleSkip}>
                {t("onboarding_skip")}
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleNext}
              >
                {isLast ? t("onboarding_start") : t("onboarding_next")}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}