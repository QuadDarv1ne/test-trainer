"use client";

import { useTheme } from "next-themes";
import { useLocale } from "@/lib/i18n.client";
import { Beaker, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 text-muted-foreground hover:text-foreground"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      suppressHydrationWarning
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

  return (
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
            <LocaleToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
