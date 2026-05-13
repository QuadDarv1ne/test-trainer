"use client";

import { useState } from "react";
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
import { Trash2, Send, AlertCircle, Keyboard, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TestCase } from "@/lib/evaluator";
import { categoryColors, categoryI18nKeys } from "./test-form";
import { useLocale } from "@/lib/i18n.client";
import { useAppStore } from "@/lib/store";

interface TestListProps {
  testCases?: TestCase[];
  onRemove?: (id: string) => void;
  onSubmit?: () => void;
  onReorder?: (reordered: TestCase[]) => void;
}

function SortableRow({
  tc,
  idx,
  onRemove,
}: {
  tc: TestCase;
  idx: number;
  onRemove: (id: string) => void;
}) {
  const { t } = useLocale();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: tc.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style} key={tc.id}>
      <TableCell className="py-2 w-8 cursor-grab active:cursor-grabbing">
        <button
          {...attributes}
          {...listeners}
          className="h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label={t("test_list_drag")}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground py-2 w-8">
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
          {t(categoryI18nKeys[tc.category])}
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
  );
}

export function TestList({
  testCases: testCasesProp,
  onRemove: onRemoveProp,
  onSubmit: onSubmitProp,
  onReorder: onReorderProp,
}: TestListProps) {
  const { t } = useLocale();
  const [activeId, setActiveId] = useState<string | null>(null);

  const storeTestCases = useAppStore((s) => s.testCases);
  const storeRemove = useAppStore((s) => s.removeTestCase);
  const storeReorder = useAppStore((s) => s.reorderTestCases);

  const testCases = testCasesProp ?? storeTestCases;
  const onRemove = onRemoveProp ?? storeRemove;
  const onReorder = onReorderProp ?? storeReorder;
  const onSubmit = onSubmitProp ?? (() => {
    // Default submit - just trigger evaluation via custom event
    window.dispatchEvent(new CustomEvent("test-submit"));
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = testCases.findIndex((tc) => tc.id === active.id);
      const newIndex = testCases.findIndex((tc) => tc.id === over.id);
      const reordered = arrayMove(testCases, oldIndex, newIndex);
      onReorder(reordered);
    }
  }
  if (testCases.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {t("test_list_empty")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("test_list_empty_hint")}
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
            {t("test_list_title")} ({testCases.length})
          </CardTitle>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={onSubmit}
          >
            <Send className="h-3.5 w-3.5 mr-1" />
            {t("test_list_check")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-80 overflow-y-auto custom-scrollbar">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={({ active }) => setActiveId(active.id as string)}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-8"></TableHead>
                  <TableHead className="text-xs w-8">#</TableHead>
                  <TableHead className="text-xs">{t("test_list_col_input")}</TableHead>
                  <TableHead className="text-xs">{t("test_list_col_expected")}</TableHead>
                  <TableHead className="text-xs">{t("test_list_col_category")}</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext items={testCases.map((tc) => tc.id)}>
                  {testCases.map((tc, idx) => (
                    <SortableRow
                      key={tc.id}
                      tc={tc}
                      idx={idx}
                      onRemove={onRemove}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </DndContext>
        </div>
      </CardContent>
      {/* Keyboard shortcut hints */}
      <div className="px-4 pb-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Keyboard className="h-3 w-3" />
          <span>
            <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[9px]">Ctrl</kbd>
            {" + "}
            <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[9px]">Enter</kbd>
            {" — "}{t("test_list_shortcut_check")}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>
            <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[9px]">Ctrl</kbd>
            {" + "}
            <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[9px]">Z</kbd>
            {" — "}{t("test_list_shortcut_undo")}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>
            <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[9px]">Esc</kbd>
            {" — "}{t("test_list_shortcut_reset")}
          </span>
        </div>
      </div>
    </Card>
  );
}
