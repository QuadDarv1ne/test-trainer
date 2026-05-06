"use client";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  condition: (context: AchievementContext) => boolean;
}

export interface AchievementContext {
  completedTasks: number;
  totalTasks: number;
  bestScores: Record<number, number>;
  totalAttempts: number;
  perfectScores: number; // count of tasks with 100%
  attemptHistory: { taskId: number; score: number; timestamp: number }[];
  maxBvCoverage?: number; // highest boundary value coverage % from any single submission
  examsCompleted?: number; // number of exams completed
  maxEcCoverage?: number; // highest equivalence class coverage % from any single submission
  examAvgScore?: number; // average score across completed exams
}

const ACHIEVEMENTS_KEY = "test-trainer-achievements";

export const achievements: Achievement[] = [
  {
    id: "first_blood",
    name: "Первый тест",
    description: "Отправьте первую проверку тест-кейсов",
    icon: "🎯",
    condition: (ctx) => ctx.totalAttempts >= 1,
  },
  {
    id: "first_perfect",
    name: "Безупречно",
    description: "Получите оценку 100% по любому заданию",
    icon: "💯",
    condition: (ctx) => ctx.perfectScores >= 1,
  },
  {
    id: "half_done",
    name: "Наполовину",
    description: "Выполните половину заданий",
    icon: "⭐",
    condition: (ctx) => ctx.completedTasks >= Math.ceil(ctx.totalTasks / 2),
  },
  {
    id: "all_done",
    name: "Мастер тестирования",
    description: "Выполните все задания",
    icon: "🏆",
    condition: (ctx) => ctx.completedTasks >= ctx.totalTasks,
  },
  {
    id: "all_perfect",
    name: "Перфекционист",
    description: "Получите 100% по всем заданиям",
    icon: "👑",
    condition: (ctx) => ctx.perfectScores >= ctx.totalTasks,
  },
  {
    id: "persistent",
    name: "Настойчивый",
    description: "Выполните 10 проверок",
    icon: "🔥",
    condition: (ctx) => ctx.totalAttempts >= 10,
  },
  {
    id: "explorer",
    name: "Исследователь",
    description: "Попробуйте все задания хотя бы раз",
    icon: "🧭",
    condition: (ctx) => Object.keys(ctx.bestScores).length >= ctx.totalTasks,
  },
  {
    id: "good_student",
    name: "Отличник",
    description: "Получите оценку ≥90% по 3 заданиям",
    icon: "📚",
    condition: (ctx) =>
      Object.values(ctx.bestScores).filter((s) => s >= 90).length >= 3,
  },
  {
    id: "exam_passer",
    name: "Экзаменатор",
    description: "Завершите экзамен хотя бы раз",
    icon: "📝",
    condition: (ctx) => (ctx.examsCompleted ?? 0) >= 1,
  },
  {
    id: "boundary_hunter",
    name: "Охотник за границами",
    description: "Покройте все граничные значения в одном задании",
    icon: "🔍",
    condition: (ctx) => (ctx.maxBvCoverage ?? 0) >= 100,
  },
  {
    id: "speed_demon",
    name: "Скоростной",
    description: "Завершите экзамен, получив среднюю оценку ≥80%",
    icon: "⚡",
    condition: (ctx) => (ctx.examAvgScore ?? 0) >= 80,
  },
  {
    id: "completer",
    name: "Завершающий",
    description: "Покройте 100% классов эквивалентности в задании",
    icon: "✅",
    condition: (ctx) => (ctx.maxEcCoverage ?? 0) >= 100,
  },
];

export function loadUnlockedAchievements(): string[] {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUnlockedAchievements(ids: string[]): void {
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function checkAndUnlockAchievements(
  context: AchievementContext
): string[] {
  const previouslyUnlocked = loadUnlockedAchievements();
  const newlyUnlocked: string[] = [];

  for (const achievement of achievements) {
    if (
      !previouslyUnlocked.includes(achievement.id) &&
      achievement.condition(context)
    ) {
      newlyUnlocked.push(achievement.id);
    }
  }

  if (newlyUnlocked.length > 0) {
    const allUnlocked = [...previouslyUnlocked, ...newlyUnlocked];
    saveUnlockedAchievements(allUnlocked);
  }

  return newlyUnlocked;
}
