"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Timer,
  Trophy,
  RotateCcw,
  ChevronRight,
  Clock,
  CheckCircle2,
  StopCircle,
} from "lucide-react";
import { Confetti } from "./confetti";
import { tasks } from "@/lib/tasks";
import type { Task } from "@/lib/tasks";
import { evaluateTestCases } from "@/lib/evaluator";
import type { TestCase, EvaluationResult } from "@/lib/evaluator";
import { toast } from "sonner";
import { saveAttempt } from "@/lib/storage";
import { ResultsPanel } from "./results-panel";
import { useLocale } from "@/lib/i18n.client";

type ExamState = "setup" | "running" | "results";

export function ExamMode() {
  const { t } = useLocale();
  const [examState, setExamState] = useState<ExamState>("setup");
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [timeLimit, setTimeLimit] = useState(10); // minutes
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [examTasks, setExamTasks] = useState<Task[]>([]);
  const [examTestCases, setExamTestCases] = useState<Record<number, TestCase[]>>({});
  const [examResults, setExamResults] = useState<EvaluationResult[]>([]);
  const [examInputs, setExamInputs] = useState<string[]>([]);
  const [examExpected, setExamExpected] = useState("");
  const [examCategory] = useState<string>("Нормальное значение");
  const [showConfetti, setShowConfetti] = useState(false);
  const finishExamRef = useRef<() => void>(null);
  const examTestCasesRef = useRef(examTestCases);
  const examResultsRef = useRef(examResults);
  const examTasksRef = useRef(examTasks);

  useEffect(() => {
    examTestCasesRef.current = examTestCases;
  }, [examTestCases]);

  useEffect(() => {
    examResultsRef.current = examResults;
  }, [examResults]);

  useEffect(() => {
    examTasksRef.current = examTasks;
  }, [examTasks]);

  const completedCount = examResults.length;

  const triggerConfetti = useCallback((results: EvaluationResult[]) => {
    const avg =
      results.length > 0
        ? Math.round(
            results.reduce((s, r) => s + r.overallScore, 0) / results.length
          )
        : 0;
    if (avg >= 90) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    }
  }, []);

  const finishExam = useCallback(() => {
    // Submit remaining unsent tasks — use refs to get latest values
    const results = [...examResultsRef.current];
    const currentTasks = examTasksRef.current;
    const currentTestCases = examTestCasesRef.current;
    for (const task of currentTasks) {
      if (!results.find((r) => r.task.id === task.id)) {
        const tcs = currentTestCases[task.id] || [];
        if (tcs.length > 0) {
          const result = evaluateTestCases(task, tcs);
          // Save each remaining task result to attempt history
          saveAttempt({
            taskId: task.id,
            score: result.overallScore,
            ecCoverage: result.ecCoverage,
            bvCoverage: result.boundaryCoverage,
            correctnessScore: result.correctnessScore,
            timestamp: Date.now(),
            testCasesCount: tcs.length,
          });
          results.push(result);
        }
      }
    }
    setExamResults(results);
    setExamState("results");
    window.dispatchEvent(new Event("achievements-updated"));
    triggerConfetti(results);
  }, [triggerConfetti]);

  useEffect(() => {
    finishExamRef.current = finishExam;
  }, [finishExam]);

  // Stable countdown interval — does not recreate on every tick
  useEffect(() => {
    if (examState !== "running") return;
    const interval = setInterval(() => {
      setTimeRemaining((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [examState]);

  // Trigger finish when timer reaches zero
  useEffect(() => {
    if (examState === "running" && timeRemaining <= 0) {
      finishExamRef.current?.();
    }
  }, [examState, timeRemaining]);

  const toggleTask = (id: number) => {
    setSelectedTasks((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const startExam = () => {
    if (selectedTasks.length === 0) {
      toast.error(t("exam_select_at_least_one"));
      return;
    }
    // Shuffle selected tasks
    const shuffled = selectedTasks
      .map((id) => tasks.find((t) => t.id === id))
      .filter((task): task is NonNullable<typeof task> => task !== undefined)
      .sort(() => Math.random() - 0.5);
    setExamTasks(shuffled);
    setExamTestCases({});
    setExamResults([]);
    setCurrentTaskIndex(0);
    setExamInputs(shuffled.length > 0 ? shuffled[0].params.map(() => "") : []);
    setExamExpected("");
    setTimeRemaining(timeLimit * 60);
    setExamState("running");
  };

  const addExamTestCase = useCallback(() => {
    const task = examTasks[currentTaskIndex];
    if (!task) return;
    if (examInputs.some((v) => v.trim() === "") || !examExpected.trim()) return;
    const tc: TestCase = {
      id: `tc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      inputs: examInputs.map((v) => v.trim()),
      expectedOutput: examExpected.trim(),
      category: examCategory as TestCase["category"],
      comment: "",
    };
    setExamTestCases((prev) => ({
      ...prev,
      [task.id]: [...(prev[task.id] || []), tc],
    }));
    setExamInputs(task.params.map(() => ""));
    setExamExpected("");
    toast.success(t("exam_add_test_case"));
  }, [examTasks, currentTaskIndex, examInputs, examExpected, examCategory, t]);

  const submitCurrentTask = useCallback(() => {
    const task = examTasksRef.current[currentTaskIndex];
    if (!task) return;
    const tcs = examTestCasesRef.current[task.id] || [];
    if (tcs.length === 0) {
      toast.error(t("exam_add_at_least_one"));
      return;
    }
    const result = evaluateTestCases(task, tcs);

    // Save this task's result to attempt history
    saveAttempt({
      taskId: task.id,
      score: result.overallScore,
      ecCoverage: result.ecCoverage,
      bvCoverage: result.boundaryCoverage,
      correctnessScore: result.correctnessScore,
      timestamp: Date.now(),
      testCasesCount: tcs.length,
    });

    // Use functional update to avoid stale closure on examResults
    const isLastTask = currentTaskIndex >= examTasksRef.current.length - 1;
    setExamResults((prev) => {
      // Prevent double-submit of the same task
      if (prev.find((r) => r.task.id === task.id)) return prev;
      return [...prev, result];
    });

    if (isLastTask) {
      setExamState("results");
      window.dispatchEvent(new Event("achievements-updated"));
      triggerConfetti([...examResults, result]);
    }

    if (currentTaskIndex < examTasksRef.current.length - 1) {
      const nextTask = examTasksRef.current[currentTaskIndex + 1];
      setCurrentTaskIndex((i) => i + 1);
      setExamInputs(nextTask.params.map(() => ""));
      setExamExpected("");
      toast.success(t("exam_task_checked").replace("{name}", task.name).replace("{score}", String(result.overallScore)));
    }
  }, [currentTaskIndex, t, triggerConfetti]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const avgScore =
    examResults.length > 0
      ? Math.round(
          examResults.reduce((s, r) => s + r.overallScore, 0) / examResults.length
        )
      : 0;

  const timePerTask = selectedTasks.length > 0
    ? Math.round((timeLimit * 60) / selectedTasks.length)
    : 0;

  // SETUP SCREEN
  if (examState === "setup") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-4"
      >
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-emerald-600" />
              {t("exam_title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("exam_subtitle")}
            </p>
            <div className="space-y-2">
              <p className="text-xs font-medium">{t("exam_select_tasks_label")}</p>
              <div className="grid grid-cols-2 gap-2">
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`text-left p-2 rounded-lg border text-xs transition-all ${
                      selectedTasks.includes(task.id)
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                        : "border-border hover:border-emerald-300"
                    }`}
                  >
                    <span className="font-medium">{task.name}</span>
                    <Badge variant="secondary" className="ml-2 text-[9px]">
                      {task.difficulty}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium">{t("exam_time_limit")}</p>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => setTimeLimit(minutes)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      timeLimit === minutes
                        ? "border-emerald-500 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "border-border hover:border-emerald-300"
                    }`}
                  >
                    {minutes} {t("exam_min")}
                  </button>
                ))}
              </div>
            </div>

            {/* Time per task estimate */}
            {selectedTasks.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  ≈ {Math.floor(timePerTask / 60)}:
                  {(timePerTask % 60).toString().padStart(2, "0")} {t("exam_per_task_time")}
                </span>
              </div>
            )}

            <Button
              onClick={startExam}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={selectedTasks.length === 0}
            >
              {t("exam_start_btn").replace("{count}", String(selectedTasks.length))}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // RUNNING SCREEN
  if (examState === "running") {
    const task = examTasks[currentTaskIndex];
    if (!task) return null;
    const isTimeLow = timeRemaining < 60;
    const taskTestCases = examTestCases[task.id] || [];
    const progressPercent =
      examTasks.length > 0 ? (completedCount / examTasks.length) * 100 : 0;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto space-y-4"
      >
        {/* Timer bar */}
        <div
          className={`p-3 rounded-lg border ${
            isTimeLow
              ? "border-rose-300 bg-rose-50 dark:bg-rose-900/20"
              : "border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Timer
                className={`h-4 w-4 ${
                  isTimeLow ? "text-rose-600" : "text-emerald-600"
                }`}
              />
              <span
                className={`font-mono text-lg font-bold ${
                  isTimeLow
                    ? "text-rose-600"
                    : "text-emerald-700 dark:text-emerald-400"
                }`}
              >
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{t("exam_task_progress").replace("{current}", String(currentTaskIndex + 1)).replace("{total}", String(examTasks.length))}</span>
              <Badge variant="secondary">{task.name}</Badge>
            </div>
          </div>
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <Progress value={progressPercent} className="h-1.5 flex-1" />
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <CheckCircle2 className="h-3 w-3" />
              <span>{completedCount}/{examTasks.length}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-[10px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
              onClick={finishExam}
            >
              <StopCircle className="h-3 w-3 mr-1" />
              {t("exam_finish")}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-4 space-y-3">
            <div>
              <p className="text-sm font-medium">{task.name}</p>
              <code className="text-xs text-muted-foreground font-mono">
                {task.signature}
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                {task.description}
              </p>
              {/* Show task params so user knows expected inputs */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {task.params.map((param) => (
                  <Badge
                    key={param.name}
                    variant="outline"
                    className="text-[10px] font-mono normal-case"
                  >
                    {param.name}: {param.type}
                  </Badge>
                ))}
              </div>
            </div>

            {/* One input per param, same pattern as TestForm */}
            {task.params.map((param, idx) => (
              <div key={param.name} className="space-y-1">
                <Label className="text-xs font-medium">
                  {param.name}
                  <span className="text-muted-foreground ml-1">({param.type})</span>
                </Label>
                <Input
                  placeholder={
                    param.type === "string"
                      ? 'Например: "Abc123!@"'
                      : param.type === "boolean"
                      ? "true / false"
                      : "Например: 5, 0, -1"
                  }
                  value={examInputs[idx] ?? ""}
                  onChange={(e) => {
                    setExamInputs((prev) => {
                      const newInputs = [...prev];
                      newInputs[idx] = e.target.value;
                      return newInputs;
                    });
                  }}
                  className="h-9 text-sm"
                />
              </div>
            ))}

            <div className="space-y-1">
              <Label className="text-xs font-medium">{t("exam_expected_result")}</Label>
              <Input
                placeholder={
                  task.returnType === "boolean"
                    ? "true / false"
                    : task.returnType === "string"
                    ? 'Например: "равносторонний"'
                    : task.returnType.startsWith("{")
                    ? '{ valid: true, errors: [] }'
                    : "Например: 120"
                }
                value={examExpected}
                onChange={(e) => setExamExpected(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={addExamTestCase}
                disabled={
                  examInputs.some((v) => v.trim() === "") ||
                  !examExpected.trim()
                }
              >
                {t("exam_add")}
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={submitCurrentTask}
                disabled={taskTestCases.length === 0}
              >
                <ChevronRight className="h-3.5 w-3.5 mr-1" />
                {currentTaskIndex < examTasks.length - 1 ? t("exam_next") : t("exam_complete")}
              </Button>
            </div>
            {taskTestCases.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {t("exam_test_cases_count").replace("{count}", String(taskTestCases.length))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // RESULTS SCREEN
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-4"
    >
      <Confetti active={showConfetti} />
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-6 text-center">
          <Trophy className="h-10 w-10 text-amber-500 mx-auto mb-2" />
          <h2 className="text-xl font-bold">{t("exam_finished_title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("exam_avg_score").replace("{score}", String(avgScore)).replace("{count}", String(examResults.length))}
          </p>
          {avgScore >= 80 && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
              {t("exam_excellent")}
            </p>
          )}
        </CardContent>
      </Card>
      {examResults.map((result) => {
        const handleReset = () => {
          setExamResults((prev) => prev.filter((r) => r.task.id !== result.task.id));
          const taskIndex = examTasks.findIndex((t) => t.id === result.task.id);
          if (taskIndex >= 0) {
            setCurrentTaskIndex(taskIndex);
            const task = examTasks[taskIndex];
            setExamInputs(task.params.map(() => ""));
            setExamExpected("");
            setExamTestCases((prev) => ({ ...prev, [task.id]: [] }));
            setExamState("running");
            toast.info(t("exam_reset_task").replace("{name}", task.name));
          }
        };
        return (
          <ResultsPanel key={result.task.id} result={result} onReset={handleReset} />
        );
      })}
      <div className="flex justify-center gap-2">
        <Button variant="outline" onClick={() => setExamState("setup")}>
          <RotateCcw className="h-4 w-4 mr-1" />
          {t("exam_new_exam")}
        </Button>
      </div>
    </motion.div>
  );
}