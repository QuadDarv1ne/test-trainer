"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Code2,
  FileText,
  Tag,
  Layers,
  GitBranch,
  Info,
} from "lucide-react";
import type { Task } from "@/lib/tasks";

interface TaskWorkspaceProps {
  task: Task;
}

export function TaskWorkspace({ task }: TaskWorkspaceProps) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pr-4">
        {/* Task info */}
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Info className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-base">{task.name}</CardTitle>
              <Badge variant="secondary" className="ml-auto text-xs">
                {task.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {task.description}
            </p>

            {/* Signature */}
            <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-zinc-400">
                  Сигнатура функции
                </span>
              </div>
              <code className="text-sm font-mono text-emerald-300">
                {task.signature}
              </code>
            </div>

            {/* Parameters */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">Параметры</span>
              </div>
              <div className="space-y-1.5">
                {task.params.map((param) => (
                  <div
                    key={param.name}
                    className="flex items-center gap-2 text-xs bg-muted/50 rounded-md p-2"
                  >
                    <code className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                      {param.name}
                    </code>
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      {param.type}
                    </Badge>
                    <span className="text-muted-foreground ml-auto">
                      {param.description}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-xs bg-muted/50 rounded-md p-2">
                  <span className="text-muted-foreground">Возвращаемое:</span>
                  <code className="font-mono text-teal-700 dark:text-teal-400 font-medium">
                    {task.returnType}
                  </code>
                </div>
              </div>
            </div>

            {/* Code */}
            <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-3 overflow-x-auto">
              <div className="flex items-center gap-2 mb-2">
                <Code2 className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-xs font-medium text-zinc-400">
                  Реализация
                </span>
              </div>
              <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
                <code>{task.code}</code>
              </pre>
            </div>

            {/* Equivalence classes */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-teal-600" />
                <span className="text-xs font-medium">
                  Классы эквивалентности ({task.equivalenceClasses.length})
                </span>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                {task.equivalenceClasses.map((ec) => (
                  <div
                    key={ec.id}
                    className="text-xs bg-muted/50 rounded-md p-2 space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="h-3 w-3 text-teal-500 shrink-0" />
                      <span className="font-medium">{ec.name}</span>
                    </div>
                    <p className="text-muted-foreground pl-5">
                      {ec.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Boundary values */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <GitBranch className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-xs font-medium">
                  Граничные значения ({task.boundaryValues.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {task.boundaryValues.map((bv, idx) => (
                  <div
                    key={idx}
                    className="text-xs bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md px-2 py-1"
                  >
                    <code className="font-mono text-amber-800 dark:text-amber-300">
                      {Array.isArray(bv.value)
                        ? `[${bv.value.join(", ")}]`
                        : String(bv.value)}
                    </code>
                    <span className="text-muted-foreground ml-1 hidden sm:inline">
                      — {bv.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
