"use client";

import { useLocale } from "@/lib/i18n.client";

export function AppFooter() {
  const { t } = useLocale();

  return (
    <footer className="border-t bg-white/50 dark:bg-zinc-900/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
        {t("footer_text")}
      </div>
    </footer>
  );
}
