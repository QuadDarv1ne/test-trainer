"use client";

import { LocaleProvider as LP } from "@/lib/i18n.client";
import { ThemeProvider as TP } from "next-themes";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TP attribute="class" defaultTheme="system" enableSystem>
      <LP>
        {children}
      </LP>
      <Toaster richColors position="bottom-right" />
    </TP>
  );
}
