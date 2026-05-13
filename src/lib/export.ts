import { loadAttempts, loadProgress, loadStreak, type AttemptRecord } from "@/lib/storage";
import { loadUnlockedAchievements, achievements } from "@/lib/achievements";
import { tasks } from "@/lib/tasks";

export interface ExportData {
  meta: {
    exportedAt: string;
    version: string;
  };
  summary: {
    totalAttempts: number;
    avgScore: number;
    currentStreak: number;
    longestStreak: number;
    achievementsUnlocked: number;
    achievementsTotal: number;
  };
  bestProgress: Record<string, {
    taskName: string;
    score: number;
    testCasesCount: number;
  }>;
  attempts: AttemptRecord[];
  achievements: string[];
}

function getTaskName(taskId: number): string {
  return tasks.find((t) => t.id === taskId)?.name ?? `Task #${taskId}`;
}

export function generateExportJSON(): string {
  const attempts = loadAttempts();
  const progress = loadProgress();
  const streak = loadStreak();
  const unlockedAchievementIds = loadUnlockedAchievements();

  const totalAttempts = attempts.length;
  const avgScore = totalAttempts > 0
    ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / totalAttempts)
    : 0;

  const bestProgress: Record<string, { taskName: string; score: number; testCasesCount: number }> = {};
  for (const [taskIdStr, p] of Object.entries(progress)) {
    const taskName = getTaskName(Number(taskIdStr));
    bestProgress[taskName] = {
      taskName,
      score: p.score,
      testCasesCount: p.testCases.length,
    };
  }

  const data: ExportData = {
    meta: {
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
    },
    summary: {
      totalAttempts,
      avgScore,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      achievementsUnlocked: unlockedAchievementIds.length,
      achievementsTotal: achievements.length,
    },
    bestProgress,
    attempts,
    achievements: unlockedAchievementIds,
  };

  return JSON.stringify(data, null, 2);
}

export function generateExportCSV(): string {
  const attempts = loadAttempts();
  const progress = loadProgress();
  const streak = loadStreak();
  const unlockedAchievements = loadUnlockedAchievements();

  const BOM = "\uFEFF";
  const lines: string[] = [];

  // Summary section
  const totalAttempts = attempts.length;
  const avgScore = totalAttempts > 0
    ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / totalAttempts)
    : 0;

  lines.push("Section,Key,Value");
  lines.push(`Summary,Total Attempts,${totalAttempts}`);
  lines.push(`Summary,Average Score,${avgScore}%`);
  lines.push(`Summary,Current Streak,${streak.currentStreak}`);
  lines.push(`Summary,Longest Streak,${streak.longestStreak}`);
  lines.push(`Summary,Achievements,${unlockedAchievements.length}/${achievements.length}`);
  lines.push(`Summary,Export Date,${new Date().toISOString()}`);
  lines.push("");

  // Best progress per task
  lines.push("Section,Task,Best Score,Test Cases");
  for (const [taskIdStr, p] of Object.entries(progress)) {
    const taskName = getTaskName(Number(taskIdStr));
    lines.push(`Progress,${taskName},${p.score}%,${p.testCases.length}`);
  }
  lines.push("");

  // Attempts history
  if (attempts.length > 0) {
    lines.push("Section,Task,Score,EC Coverage,BV Coverage,Correctness,Date,Test Cases Count");
    for (const a of attempts) {
      const taskName = getTaskName(a.taskId);
      const date = new Date(a.timestamp).toISOString();
      lines.push(`Attempt,${taskName},${a.score}%,${a.ecCoverage}%,${a.bvCoverage}%,${a.correctnessScore}%,${date},${a.testCasesCount}`);
    }
    lines.push("");
  }

  // Achievements
  lines.push("Section,Achievement ID,Status");
  for (const a of achievements) {
    lines.push(`Achievement,${a.id},${unlockedAchievements.includes(a.id) ? "Unlocked" : "Locked"}`);
  }

  return BOM + lines.join("\n");
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadJSON(): void {
  const json = generateExportJSON();
  const date = new Date().toISOString().slice(0, 10);
  downloadFile(json, `test-trainer-results-${date}.json`, "application/json");
}

export function downloadCSV(): void {
  const csv = generateExportCSV();
  const date = new Date().toISOString().slice(0, 10);
  downloadFile(csv, `test-trainer-results-${date}.csv`, "text/csv;charset=utf-8");
}
