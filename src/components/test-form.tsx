"use client";

import { useState, useEffect } from "react";
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
import { Plus, X } from "lucide-react";
import type { Task, TestCaseCategory } from "@/lib/tasks";

const categories: TestCaseCategory[] = [
  "Нормальное значение",
  "Граничное значение",
  "Исключение",
  "Недопустимый тип",
];

const categoryColors: Record<TestCaseCategory, string> = {
  "Нормальное значение": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Граничное значение": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  "Исключение": "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
  "Недопустимый тип": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

export { categories, categoryColors };

interface TestFormProps {
  task: Task;
  onAdd: (inputs: string[], expected: string, category: TestCaseCategory, comment: string) => void;
}

const emptyInputs = (paramsCount: number) => paramsCount.map(() => "");

export function TestForm({ task, onAdd }: TestFormProps) {
  const [inputs, setInputs] = useState<string[]>(() => emptyInputs(task.params));
  const [expected, setExpected] = useState("");
  const [category, setCategory] = useState<TestCaseCategory>("Нормальное значение");
  const [comment, setComment] = useState("");

  // Reset form when task changes
  const paramCount = task.params.length;
  useEffect(() => {
    setInputs(emptyInputs(task.params));
    setExpected("");
    setComment("");
    setCategory("Нормальное значение");
  }, [paramCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputs.some((v) => v.trim() === "") || !expected.trim()) return;
    onAdd(inputs, expected.trim(), category, comment.trim());
    setInputs(task.params.map(() => ""));
    setExpected("");
    setComment("");
  };

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
          {task.params.map((param, idx) => {
            const inputValue = inputs[idx];
            const typeWarning =
              param.type === "number" &&
              inputValue !== "" &&
              isNaN(Number(inputValue.trim())) &&
              inputValue.trim() !== "";
            return (
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
              {typeWarning && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400">
                  Ожидается число, введено: «{inputValue}»
                </p>
              )}
            </div>
            );
          })}

          <div className="space-y-1">
            <Label className="text-xs font-medium">Ожидаемый результат</Label>
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
              className="h-9 text-sm"
            />
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
