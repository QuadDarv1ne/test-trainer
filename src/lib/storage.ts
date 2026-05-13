import type { TestCase } from "./evaluator";
import { toast } from "sonner";

const PROGRESS_KEY = "test-trainer-progress";
const SESSION_PREFIX = "test-trainer-session-";
const ATTEMPTS_KEY = "test-trainer-attempts";
const STREAK_KEY = "test-trainer-streak";

export interface TaskProgress {
  score: number;
  testCases: TestCase[];
}

export interface AttemptRecord {
  taskId: number;
  score: number;
  ecCoverage: number;
  bvCoverage: number;
  correctnessScore: number;
  timestamp: number;
  testCasesCount: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastAttemptDate: string | null;
}

/**
 * Сохраняет лучший результат для задачи
 */
export function saveProgress(
  taskId: number,
  score: number,
  testCases: TestCase[]
): void {
  try {
    const progress = loadProgress();
    const existing = progress[taskId];

    // Сохраняем только если результат лучше
    if (!existing || score > existing.score) {
      progress[taskId] = { score, testCases };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      toast.error("Хранилище браузера заполнено. Очистите данные сайта.");
    }
  }
}

/**
 * Загружает все сохранённые результаты
 */
export function loadProgress(): Record<number, TaskProgress> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Сохраняет текущую сессию работы над задачей
 */
export function saveCurrentSession(
  taskId: number,
  testCases: TestCase[]
): void {
  try {
    localStorage.setItem(SESSION_PREFIX + taskId, JSON.stringify(testCases));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      toast.error("Хранилище браузера заполнено. Очистите данные сайта.");
    }
  }
}

/**
 * Загружает сохранённую сессию для задачи
 */
export function loadCurrentSession(taskId: number): TestCase[] | null {
  try {
    const raw = localStorage.getItem(SESSION_PREFIX + taskId);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Сохраняет запись о попытке (для статистики)
 */
export function saveAttempt(record: AttemptRecord): void {
  try {
    const attempts = loadAttempts();
    attempts.push(record);
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));

    // Обновляем streak
    updateStreak(record.timestamp);
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      toast.error("Хранилище браузера заполнено. Очистите данные сайта.");
    }
  }
}

/**
 * Загружает все попытки
 */
export function loadAttempts(): AttemptRecord[] {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Загружает попытки для конкретной задачи
 */
export function getTaskHistory(taskId: number): AttemptRecord[] {
  const allAttempts = loadAttempts();
  return allAttempts.filter((a) => a.taskId === taskId);
}

/**
 * Обновляет серию попыток
 */
function updateStreak(timestamp: number): void {
  const streak = loadStreak();
  const lastDate = streak.lastAttemptDate
    ? new Date(streak.lastAttemptDate)
    : null;
  const currentDate = new Date(timestamp);

  // Проверяем, что это не тот же самый день
  if (
    lastDate &&
    currentDate.toDateString() === lastDate.toDateString()
  ) {
    return;
  }

  // Проверяем, что это не следующий день после последней попытки
  const expectedDate = lastDate
    ? new Date(lastDate.getTime() + 86400000)
    : null;
  const isConsecutive = expectedDate
    ? currentDate.toDateString() === expectedDate.toDateString()
    : false;

  if (isConsecutive) {
    streak.currentStreak += 1;
  } else if (
    !lastDate ||
    currentDate.getTime() > lastDate.getTime() + 86400000
  ) {
    streak.currentStreak = 1;
  }

  streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
  streak.lastAttemptDate = currentDate.toISOString();

  saveStreak(streak);
}

/**
 * Сохраняет данные о серии
 */
export function saveStreak(streak: StreakData): void {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      toast.error("Хранилище браузера заполнено. Очистите данные сайта.");
    }
  }
}

/**
 * Загружает данные о серии
 */
export function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) {
      return { currentStreak: 0, longestStreak: 0, lastAttemptDate: null };
    }
    return JSON.parse(raw);
  } catch {
    return { currentStreak: 0, longestStreak: 0, lastAttemptDate: null };
  }
}

/**
 * Очищает весь прогресс
 */
export function clearAllProgress(): void {
  try {
    const keysToRemove = Object.keys(localStorage).filter((key) =>
      key.startsWith("test-trainer-")
    );
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      toast.error("Хранилище браузера заполнено. Очистите данные сайта.");
    }
  }
}
