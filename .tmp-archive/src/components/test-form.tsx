"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Calculator } from "lucide-react";
import type { Task, TestCaseCategory } from "@/lib/tasks";
import { runReferenceFunction } from "@/lib/tasks";
import { categories, categoryColors } from "@/lib/constants";

interface TestFormProps {
  task: Task;
  onAdd: (inputs: string[], expected: string, category: TestCaseCategory, comment: string) => void;
}

export function TestForm({ task, onAdd }: TestFormProps) {
  const [inputs, setInputs] = useState<string[]>(
    task.params.map(() => "")
  );
  const [expected, setExpected] = useState("");
  const [category, setCategory] = useState<TestCaseCategory>("Нормальное значение");
  const [comment, setComment] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputs.some((v) => v.trim() === "") || !expected.trim()) return;
    onAdd(inputs, expected.trim(), category, comment.trim());
    setInputs(task.params.map(() => ""));
    setExpected("");
    setComment("");
  };

  // Parse input string to typed value (same logic as evaluator)
  const parseInputForRef = useCallback((v: string) => {
    const trimmed = v.trim();
    if (trimmed === "true" || trimmed === "да" || trimmed === "верно") return true;
    if (trimmed === "false" || trimmed === "нет" || trimmed === "неверно") return false;
    if (trimmed === "null") return null;
    const num = Number(trimmed);
    if (trimmed !== "" && !isNaN(num) && /^-?\d+(\.\d+)?$/.test(trimmed)) return num;
    try { const p = JSON.parse(trimmed); if (typeof p === "object") return p; } catch {}
    return trimmed;
  }, []);

  const handleCalculate = useCallback(() => {
    if (inputs.some((v) => v.trim() === "")) return;
    setIsCalculating(true);
    // Use requestAnimationFrame so the button shows loading state
    requestAnimationFrame(() => {
      try {
        const parsedInputs = inputs.map(parseInputForRef);
        const { result, error } = runReferenceFunction(task.id, parsedInputs);
        if (error) {
          setExpected(`Ошибка: ${error}`);
        } else {
          const output = typeof result === "object" ? JSON.stringify(result) : String(result);
          setExpected(output);
        }
      } catch {
        setExpected("Ошибка вычисления");
      } finally {
        setIsCalculating(false);
      }
    });
  }, [inputs, task.id, parseInputForRef]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Plus className="h-4 w-4 text-emerald-600" />
          Добавить тест-кейс
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          {task.params.map((param, idx) => (
            <div key={param.name} className="space-y-1">
              <Label className="text-xs font-medium">
                {param.name}
                <span className="text-muted-foreground ml-1">
                  ({param.type})
                </span>
              </Label>
              <Input
                placeholder={
                  param.type === "string"
                    ? 'Например: "Abc123!@"'
                    : param.type === "boolean"
                      ? "true / false"
                      : "Например: 5, 0, -1"
                }
                value={inputs[idx]}
                onChange={(e) => {
                  const newInputs = [...inputs];
                  newInputs[idx] = e.target.value;
                  setInputs(newInputs);
                }}
                className="h-9 text-sm"
              />
            </div>
          ))}

          <div className="space-y-1">
            <Label className="text-xs font-medium">Ожидаемый результат</Label>
            <div className="flex gap-2">
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
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
                className="h-9 text-sm flex-1"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={handleCalculate}
                    disabled={inputs.some((v) => v.trim() === "") || isCalculating}
                  >
                    <Calculator className={`h-4 w-4 ${isCalculating ? "animate-spin" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Вычислить ожидаемый результат по эталонной функции
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Категория</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as TestCaseCategory)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <span className="flex items-center gap-2">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          cat === "Нормальное значение"
                            ? "bg-emerald-500"
                            : cat === "Граничное значение"
                              ? "bg-amber-500"
                              : cat === "Исключение"
                                ? "bg-rose-500"
                                : "bg-purple-500"
                        }`}
                      />
                      {cat}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">
              Комментарий{" "}
              <span className="text-muted-foreground">(необязательно)</span>
            </Label>
            <Textarea
              placeholder="Заметка к тест-кейсу..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="text-sm min-h-[60px] resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={inputs.some((v) => v.trim() === "") || !expected.trim()}
          >
            <Plus className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
