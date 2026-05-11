"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Target,
  BarChart3,
  Award,
  ArrowRight,
  Copy,
  Check,
  Download,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { EvaluationResult } from "@/lib/evaluator";
import { categoryColors } from "./test-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ResultsPanelProps {
  result: EvaluationResult | null;
  onReset: () => void;
}

function ScoreCircle({
  score,
  label,
  color,
  delay,
}: {
  score: number;
  label: string;
  color: string;
  delay: number;
}) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="flex flex-col items-center"
    >
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted/30"
          />
          <motion.circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ delay: delay + 0.3, duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold">{score}%</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground mt-2 text-center max-w-[100px]">
        {label}
      </span>
    </motion.div>
  );
}

function getGrade(score: number): { text: string; color: string; emoji: string } {
  if (score >= 90) return { text: "Отлично", color: "text-emerald-600", emoji: "🌟" };
  if (score >= 75) return { text: "Хорошо", color: "text-teal-600", emoji: "👍" };
  if (score >= 60) return { text: "Удовлетворительно", color: "text-amber-600", emoji: "📝" };
  if (score >= 40) return { text: "Неудовлетворительно", color: "text-orange-600", emoji: "⚠️" };
  return { text: "Плохо", color: "text-rose-600", emoji: "❌" };
}

function formatResultsAsText(result: EvaluationResult): string {
  const lines: string[] = [];
  const grade = getGrade(result.overallScore);

  lines.push(`=== Результаты проверки ===`);
  lines.push(`Задание: ${result.task.name}`);
  lines.push(`Оценка: ${result.overallScore}% — ${grade.text}`);
  lines.push("");
  lines.push(`--- Оценки по категориям ---`);
  lines.push(`Классы эквивалентности: ${result.ecCoverage}% (${result.coveredEcsCount}/${result.totalEcs})`);
  lines.push(`Граничные значения: ${result.boundaryCoverage}% (${result.coveredBvsCount}/${result.totalBvs})`);
  lines.push(`Корректность: ${result.correctnessScore}%`);
  lines.push("");
  lines.push(`--- Детальные результаты тест-кейсов ---`);

  result.results.forEach((r, idx) => {
    lines.push(`#${idx + 1}: Вход: (${r.testCase.inputs.join(", ")})`);
    lines.push(`   Ожидание: ${r.testCase.expectedOutput}`);
    lines.push(`   Факт: ${r.actualOutput}`);
    lines.push(`   Статус: ${r.isCorrect ? "✓ Верно" : "✗ Неверно"}`);
    if (r.coveredClasses.length > 0) {
      lines.push(`   Покрытые классы: ${r.coveredClasses.join(", ")}`);
    }
    lines.push("");
  });

  if (result.uncoveredEcIds.length > 0) {
    lines.push("--- Непокрытые классы эквивалентности ---");
    for (const id of result.uncoveredEcIds) {
      const ec = result.task.equivalenceClasses.find((e) => e.id === id);
      if (ec) lines.push(`  - ${ec.name}: ${ec.description}`);
    }
    lines.push("");
  }

  if (result.uncoveredBvDescriptions.length > 0) {
    lines.push("--- Непокрытые граничные значения ---");
    for (const desc of result.uncoveredBvDescriptions) {
      lines.push(`  - ${desc}`);
    }
  }

  return lines.join("\n");
}

export function ResultsPanel({ result, onReset }: ResultsPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(formatResultsAsText(result));
      setCopied(true);
      toast.success("Результаты скопированы!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Не удалось скопировать результаты");
    }
  };

  const exportJSON = () => {
    if (!result) return;
    const grade = getGrade(result.overallScore);
    const data = {
      task: result.task.name,
      taskId: result.task.id,
      overallScore: result.overallScore,
      grade: grade.text,
      metrics: {
        equivalenceClasses: { score: result.ecCoverage, covered: result.coveredEcsCount, total: result.totalEcs },
        boundaryValues: { score: result.boundaryCoverage, covered: result.coveredBvsCount, total: result.totalBvs },
        correctness: result.correctnessScore,
      },
      testCases: result.results.map((r, idx) => ({
        index: idx + 1,
        inputs: r.testCase.inputs,
        expected: r.testCase.expectedOutput,
        actual: r.actualOutput,
        isCorrect: r.isCorrect,
        coveredClasses: r.coveredClasses,
      })),
      uncoveredEcIds: result.uncoveredEcIds,
      uncoveredBvDescriptions: result.uncoveredBvDescriptions,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `result-task-${result.task.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Экспорт в JSON завершён");
  };

  const exportCSV = () => {
    if (!result) return;
    const grade = getGrade(result.overallScore);
    const rows: string[] = [];
    rows.push("Метрика,Значение");
    rows.push(`Задание,${result.task.name}`);
    rows.push(`Общая оценка,${result.overallScore}%`);
    rows.push(`Оценка,${grade.text}`);
    rows.push(`Классы эквивалентности,${result.ecCoverage}% (${result.coveredEcsCount}/${result.totalEcs})`);
    rows.push(`Граничные значения,${result.boundaryCoverage}% (${result.coveredBvsCount}/${result.totalBvs})`);
    rows.push(`Корректность,${result.correctnessScore}%`);
    rows.push("");
    rows.push("№,Вход,Ожидание,Факт,Статус,Покрытые классы");
    result.results.forEach((r, idx) => {
      const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
      rows.push(
        `${idx + 1},${escape(r.testCase.inputs.join(", "))},${escape(r.testCase.expectedOutput)},${escape(r.actualOutput)},${r.isCorrect ? "Верно" : "Неверно"},${escape(r.coveredClasses.join(", "))}`
      );
    });
    if (result.uncoveredEcIds.length > 0) {
      rows.push("");
      rows.push("Непокрытые классы эквивалентности");
      for (const id of result.uncoveredEcIds) {
        const ec = result.task.equivalenceClasses.find((e) => e.id === id);
        if (ec) rows.push(`- ${ec.name}: ${ec.description}`);
      }
    }
    const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `result-task-${result.task.id}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Экспорт в CSV завершён");
  };

  if (!result) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">
            Результаты появятся после проверки тест-кейсов.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Выберите задание, добавьте тест-кейсы и нажмите «Проверить».
          </p>
        </CardContent>
      </Card>
    );
  }

  const grade = getGrade(result.overallScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Overall score */}
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-4xl mb-2"
            >
              {grade.emoji}
            </motion.div>
            <h2 className={`text-2xl font-bold ${grade.color}`}>
              {grade.text}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Задание: {result.task.name}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <ScoreCircle
              score={result.overallScore}
              label="Общая оценка"
              color={
                result.overallScore >= 75
                  ? "#10b981"
                  : result.overallScore >= 50
                    ? "#f59e0b"
                    : "#ef4444"
              }
              delay={0}
            />
            <ScoreCircle
              score={result.ecCoverage}
              label="Классы эквивалентности"
              color="#14b8a6"
              delay={0.1}
            />
            <ScoreCircle
              score={result.boundaryCoverage}
              label="Граничные значения"
              color="#f59e0b"
              delay={0.2}
            />
            <ScoreCircle
              score={result.correctnessScore}
              label="Корректность"
              color="#8b5cf6"
              delay={0.3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Coverage details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* EC Coverage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-teal-600" />
              Классы эквивалентности
              <Badge variant="secondary" className="ml-auto text-xs">
                {result.coveredEcsCount}/{result.totalEcs}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={result.ecCoverage} className="h-2" />
            <div className="space-y-1.5">
              {result.task.equivalenceClasses.map((ec) => {
                const covered = result.coveredEcIds.includes(ec.id);
                return (
                  <div
                    key={ec.id}
                    className={`flex items-center gap-2 text-xs p-1.5 rounded ${
                      covered
                        ? "bg-emerald-50 dark:bg-emerald-900/20"
                        : "bg-rose-50 dark:bg-rose-900/20"
                    }`}
                  >
                    {covered ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    )}
                    <span className={covered ? "text-emerald-800 dark:text-emerald-300" : "text-rose-700 dark:text-rose-400"}>
                      {ec.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Boundary Coverage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-600" />
              Граничные значения
              <Badge variant="secondary" className="ml-auto text-xs">
                {result.coveredBvsCount}/{result.totalBvs}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={result.boundaryCoverage} className="h-2" />
            <div className="space-y-1.5">
              {result.task.boundaryValues.map((bv, idx) => {
                const covered = result.coveredBvDescriptions.includes(
                  bv.description
                );
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 text-xs p-1.5 rounded ${
                      covered
                        ? "bg-emerald-50 dark:bg-emerald-900/20"
                        : "bg-rose-50 dark:bg-rose-900/20"
                    }`}
                  >
                    {covered ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    )}
                    <span className={covered ? "text-emerald-800 dark:text-emerald-300" : "text-rose-700 dark:text-rose-400"}>
                      {bv.description}:{" "}
                      <code className="font-mono">
                        {Array.isArray(bv.value)
                          ? `[${bv.value.join(", ")}]`
                          : String(bv.value)}
                      </code>
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed test results */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Детальные результаты
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Скопировано" : "Копировать"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    Экспорт
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportJSON}>
                    Экспорт в JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportCSV}>
                    Экспорт в CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-10">#</TableHead>
                  <TableHead className="text-xs">Вход</TableHead>
                  <TableHead className="text-xs">Ожидание</TableHead>
                  <TableHead className="text-xs">Факт</TableHead>
                  <TableHead className="text-xs w-20">Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.results.map((r, idx) => (
                  <TableRow key={r.testCase.id}>
                    <TableCell className="text-xs text-muted-foreground py-2">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="py-2">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                        ({r.testCase.inputs.join(", ")})
                      </code>
                    </TableCell>
                    <TableCell className="py-2">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono max-w-[100px] inline-block truncate">
                        {r.testCase.expectedOutput}
                      </code>
                    </TableCell>
                    <TableCell className="py-2">
                      <code
                        className={`text-xs px-1.5 py-0.5 rounded font-mono max-w-[150px] inline-block truncate ${
                          r.isCorrect
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
                        }`}
                      >
                        {r.actualOutput}
                      </code>
                    </TableCell>
                    <TableCell className="py-2">
                      {r.isCorrect ? (
                        <Badge className="bg-emerald-100 text-emerald-800 text-[10px] dark:bg-emerald-900/30 dark:text-emerald-400">
                          ✓ Верно
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-100 text-rose-800 text-[10px] dark:bg-rose-900/30 dark:text-rose-400">
                          ✗ Неверно
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Hints for improvement */}
      {(result.uncoveredEcIds.length > 0 || result.uncoveredBvDescriptions.length > 0) && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <ArrowRight className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm">
            <strong>Рекомендации:</strong>
            <ul className="mt-1 list-disc list-inside space-y-0.5 text-xs">
              {result.uncoveredEcIds.length > 0 && (
                <li>
                  Покройте непокрытые классы эквивалентности:{" "}
                  {result.uncoveredEcIds.map((id) => {
                    const ec = result.task.equivalenceClasses.find((e) => e.id === id);
                    return ec?.name;
                  }).filter(Boolean).join(", ")}
                </li>
              )}
              {result.uncoveredBvDescriptions.length > 0 && (
                <li>
                  Протестируйте граничные значения:{" "}
                  {result.uncoveredBvDescriptions.join(", ")}
                </li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Reset button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={onReset}
          className="mt-2"
        >
          Пройти заново
        </Button>
      </div>
    </motion.div>
  );
}
