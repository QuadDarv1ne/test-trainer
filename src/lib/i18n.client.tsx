"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { translations } from "@/lib/translations";

export type Locale = "ru" | "en";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ru");

  useEffect(() => {
    const saved = localStorage.getItem("test-trainer-locale") as Locale | null;
    if (saved && (saved === "en" || saved === "ru")) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (locale: Locale) => {
    setLocaleState(locale);
    localStorage.setItem("test-trainer-locale", locale);
  };

  const t = (key: string): string => {
    return translations[locale][key] || key;
  };

  return React.createElement(
    LocaleContext.Provider,
    { value: { locale, setLocale, t } },
    children
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
