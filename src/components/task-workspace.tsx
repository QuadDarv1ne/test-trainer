"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Code2,
  FileText,
  Tag,
  Layers,
  GitBranch,
  Info,
  Lightbulb,
} from "lucide-react";
import type { Task } from "@/lib/tasks";
import { useLocale } from "@/lib/i18n.client";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";

interface TaskWorkspaceProps {
  task: Task;
  testCasesCount?: number;
}

export function TaskWorkspace({ task, testCasesCount = 0 }: TaskWorkspaceProps) {
  const { t } = useLocale();
  const [hintIndex, setHintIndex] = useState(0);

  // Generate hints from uncovered ECs and BVs
  const allHints = [
    ...task.equivalenceClasses.map((ec) => ({
      type: "ec" as const,
      text: `${t("trainer_hint")}: ${ec.name} — ${ec.description}. ${t("form_placeholder_number").split(":")[1] || ""} ${JSON.stringify(ec.exampleValues[0])}`,
    })),
    ...task.boundaryValues.map((bv) => ({
      type: "bv" as const,
      text: `${t("trainer_hint")}: ${Array.isArray(bv.value) ? `[${bv.value.join(", ")}]` : bv.value} — ${bv.description}`,
    })),
  ];

  const showHint = testCasesCount > 0 && hintIndex < allHints.length;
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
            <div className="text-sm text-muted-foreground leading-relaxed">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>,
                  code: ({ children }) => (
                    <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                  ),
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                  li: ({ children }) => <li className="text-sm text-muted-foreground">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                }}
              >
                {task.description}
              </ReactMarkdown>
            </div>

            {/* Signature */}
            <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-zinc-400">
                  {t("trainer_signature")}
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
                <span className="text-xs font-medium">{t("trainer_params")}</span>
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
                  <span className="text-muted-foreground">{t("trainer_return_type")}:</span>
                  <code className="font-mono text-teal-700 dark:text-teal-400 font-medium">
                    {task.returnType}
                  </code>
                </div>
              </div>
            </div>

            {/* Code */}
            <div className="rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 mb-0 px-3 py-2 bg-zinc-800 dark:bg-zinc-950">
                <Code2 className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-xs font-medium text-zinc-400">
                  {t("trainer_implementation")}
                </span>
              </div>
              <SyntaxHighlighter
                language="typescript"
                style={oneDark}
                customStyle={{
                  margin: 0,
                  borderRadius: 0,
                  fontSize: "0.75rem",
                  lineHeight: "1.5",
                }}
                showLineNumbers
                wrapLines
              >
                {task.code}
              </SyntaxHighlighter>
            </div>

            {/* Progressive hint */}
            {showHint && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-medium">{t("trainer_hint")}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {hintIndex + 1}/{allHints.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => setHintIndex((i) => i + 1)}
                  >
                    {t("trainer_next_hint")}
                  </Button>
                </div>
                <div className="text-xs bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-2.5 text-amber-800 dark:text-amber-300">
                  {allHints[hintIndex].text}
                </div>
              </div>
            )}

            {/* Equivalence classes */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-teal-600" />
                <span className="text-xs font-medium">
                  {t("trainer_ec_title")} ({task.equivalenceClasses.length})
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
                  {t("trainer_bv_title")} ({task.boundaryValues.length})
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
