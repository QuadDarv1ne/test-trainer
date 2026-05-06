import type { TestCase } from "./evaluator";

const PROGRESS_KEY = "test-trainer-progress";
const SESSION_PREFIX = "test-trainer-session-";

export interface TaskProgress {
  score: number;
  testCases: TestCase[];
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
  } catch {
    // localStorage недоступен
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
    localStorage.setItem(
      SESSION_PREFIX + taskId,
      JSON.stringify(testCases)
    );
  } catch {
    // localStorage недоступен
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
