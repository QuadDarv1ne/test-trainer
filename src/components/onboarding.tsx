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

const ONBOARDING_KEY = "test-trainer-onboarding-done";

const steps = [
  {
    icon: <Sparkles className="h-8 w-8 text-emerald-600" />,
    title: "Добро пожаловать!",
    description:
      "Тренажёр тестирования поможет вам освоить методы чёрного ящика на практике. Вы будете создавать тест-кейсы для реальных функций и получать мгновенную обратную связь.",
  },
  {
    icon: <ListChecks className="h-8 w-8 text-teal-600" />,
    title: "Выберите задание",
    description:
      "Начните с выбора функции из списка заданий. Каждое задание содержит описание, классы эквивалентности и граничные значения, которые нужно покрыть.",
  },
  {
    icon: <Dumbbell className="h-8 w-8 text-amber-600" />,
    title: "Создавайте тесты",
    description:
      "Добавляйте тест-кейсы с входными значениями и ожидаемым результатом. Используйте кнопку «Подсказка», если застряли. Нажмите «Проверить» для оценки.",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
    title: "Анализируйте результаты",
    description:
      "Получите детальную оценку по трём критериям: покрытие классов эквивалентности (40%), граничных значений (30%) и корректность ожиданий (30%).",
  },
  {
    icon: <BookOpen className="h-8 w-8 text-blue-600" />,
    title: "Учитесь и растите",
    description:
      "Раздел «Теория» содержит пояснения методов тестирования. Раздел «Статистика» отслеживает ваш прогресс. Попробуйте «Режим экзамена» для вызова!",
  },
];

export function Onboarding() {
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
                      ? "w-1.5 bg-embrald-300 dark:bg-emerald-700"
                      : "w-1.5 bg-muted"
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="ghost" className="flex-1" onClick={handleSkip}>
                Пропустить
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleNext}
              >
                {isLast ? "Начать" : "Далее"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}