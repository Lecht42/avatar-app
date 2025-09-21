"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { en } from "./en";
import { uk } from "./uk";

type Locale = "en" | "uk";

type Dict = typeof en;

type I18nContextValue = {
  locale: Locale;
  dict: Dict;
  setLocale: (locale: Locale) => void;
  t: (path: string) => string;
  ready: boolean;
};

const I18nContext = createContext<I18nContextValue | null>(null);
const COOKIE_NAME = "locale";

function readInitialLocale(): Locale {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|; )locale=([^;]+)/);
    if (match) {
      const value = decodeURIComponent(match[1]);
      if (value === "en" || value === "uk") return value;
    }
  }
  if (typeof navigator !== "undefined") {
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith("uk")) return "uk";
  }
  return "en";
}

function resolveDict(locale: Locale): Dict {
  return locale === "uk" ? uk : en;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [ready, setReady] = useState(false);
  const dict = useMemo(() => resolveDict(locale), [locale]);

  useEffect(() => {
    const detected = readInitialLocale();
    setLocaleState(detected);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=31536000`;
  }, [locale, ready]);

  const setLocale = (next: Locale) => setLocaleState(next);

  const t = useCallback(
    (path: string) => {
      const segments = path.split(".");
      let cursor: unknown = dict;
      for (const segment of segments) {
        if (cursor && typeof cursor === "object" && segment in cursor) {
          cursor = (cursor as Record<string, unknown>)[segment];
        } else {
          return path;
        }
      }
      return typeof cursor === "string" ? cursor : path;
    },
    [dict]
  );

  const value = useMemo(() => ({ locale, dict, setLocale, t, ready }), [dict, locale, t, ready]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("I18nProvider missing");
  return ctx;
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, ready } = useI18n();
  const buildClass = (target: Locale) =>
    ["language-switcher__btn", locale === target ? "language-switcher__btn--active" : null]
      .filter(Boolean)
      .join(" ");

  return (
    <div className={`language-switcher ${className ?? ""}`.trim()} aria-live="polite">
      <button type="button" className={buildClass("en")} onClick={() => setLocale("en")} disabled={!ready}>
        EN
      </button>
      <button type="button" className={buildClass("uk")} onClick={() => setLocale("uk")} disabled={!ready}>
        UK
      </button>
    </div>
  );
}
