"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Send, AlertCircle, Keyboard } from "lucide-react";
import type { TestCase } from "@/lib/evaluator";
import { categoryColors } from "./test-form";

interface TestListProps {
  testCases: TestCase[];
  onRemove: (id: string) => void;
  onSubmit: () => void;
}

export function TestList({ testCases, onRemove, onSubmit }: TestListProps) {
  if (testCases.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Нет добавленных тест-кейсов.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Добавьте хотя бы один тест-кейс для проверки.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">
            Тест-кейсы ({testCases.length})
          </CardTitle>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={onSubmit}
          >
            <Send className="h-3.5 w-3.5 mr-1" />
            Проверить
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-80 overflow-y-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-12">#</TableHead>
                <TableHead className="text-xs">Вход</TableHead>
                <TableHead className="text-xs">Ожидание</TableHead>
                <TableHead className="text-xs">Категория</TableHead>
                <TableHead className="text-xs w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testCases.map((tc, idx) => (
                <TableRow key={tc.id}>
                  <TableCell className="text-xs text-muted-foreground py-2">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="py-2">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                      {tc.inputs.join(", ")}
                    </code>
                    {tc.comment && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[120px]">
                        {tc.comment}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono max-w-[120px] inline-block truncate">
                      {tc.expectedOutput}
                    </code>
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] px-1.5 py-0 ${categoryColors[tc.category]}`}
                    >
                      {tc.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemove(tc.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {/* Keyboard shortcut hint */}
      <div className="px-4 pb-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <Keyboard className="h-3 w-3" />
        <span>
          <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[9px]">Ctrl</kbd>
          {" + "}
          <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[9px]">Enter</kbd>
          {" — для проверки"}
        </span>
      </div>
    </Card>
  );
}
