import type { TestCaseCategory } from "./tasks";

export const categories: TestCaseCategory[] = [
  "Нормальное значение",
  "Граничное значение",
  "Исключение",
  "Недопустимый тип",
];

export const categoryColors: Record<TestCaseCategory, string> = {
  "Нормальное значение": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Граничное значение": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  "Исключение": "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
  "Недопустимый тип": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};
