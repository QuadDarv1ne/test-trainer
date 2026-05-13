"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { useLocale } from "@/lib/i18n.client";
import { Beaker, Sun, Moon, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-muted-foreground hover:text-foreground"
        disabled
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }
  const isDark = theme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 text-muted-foreground hover:text-foreground"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function LocaleToggle() {
  const { locale, setLocale } = useLocale();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-9 text-xs font-medium text-muted-foreground hover:text-foreground"
      onClick={() => setLocale(locale === "ru" ? "en" : "ru")}
    >
      {locale === "ru" ? "EN" : "RU"}
    </Button>
  );
}

export function AppHeader() {
  const { t } = useLocale();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  return (
    <>
    <header className="border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
              <Beaker className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t("header_title")}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t("header_subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setShortcutsOpen(true)}
              aria-label={t("shortcuts_title")}
            >
              <Keyboard className="h-4 w-4" />
            </Button>
            <LocaleToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>

    <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            {t("shortcuts_title") || "Горячие клавиши"}
          </DialogTitle>
          <DialogDescription>
            {t("shortcuts_desc") || "Быстрые комбинации для работы с тренажёром"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("shortcuts_check") || "Проверить тест-кейсы"}</span>
            <div className="flex gap-1">
              <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono border border-border">Ctrl</kbd>
              <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono border border-border">Enter</kbd>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("shortcuts_undo") || "Удалить последний тест-кейс"}</span>
            <div className="flex gap-1">
              <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono border border-border">Ctrl</kbd>
              <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono border border-border">Z</kbd>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("shortcuts_reset") || "Сбросить сессию"}</span>
            <div className="flex gap-1">
              <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono border border-border">Esc</kbd>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
