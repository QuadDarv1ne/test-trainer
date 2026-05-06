"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const shortcuts = [
  { keys: ["Ctrl", "Enter"], description: "Проверить тест-кейсы" },
  { keys: ["Ctrl", "Z"], description: "Отменить (undo)" },
  { keys: ["Ctrl", "Shift", "Z"], description: "Вернуть (redo)" },
  { keys: ["?"], description: "Показать горячие клавиши" },
  { keys: ["1", "–", "8"], description: "Быстрый выбор задания" },
  { keys: ["Esc"], description: "Закрыть диалог" },
];

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ⌨️ Горячие клавиши
          </DialogTitle>
          <DialogDescription>
            Быстрые комбинации для работы с тренажёром
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.description}
              className="flex items-center justify-between"
            >
              <span className="text-sm text-muted-foreground">
                {shortcut.description}
              </span>
              <div className="flex gap-1">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    className="px-2 py-1 rounded bg-muted text-xs font-mono border border-border"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
