"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { dictionaries, Locale } from "@/lib/i18n/dictionaries";
import { setLocale as setServerLocale } from "@/lib/i18n/actions";

type Dict = typeof dictionaries.en;

interface I18nContextType {
  dict: Dict;
  locale: string;
  setLocale: (locale: string) => Promise<void>;
}

const I18nContext = createContext<I18nContextType>({
  dict: dictionaries.en,
  locale: "en",
  setLocale: async () => {},
});

export function I18nProvider({
  children,
  locale: initialLocale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const [locale, setLocaleState] = useState<string>(initialLocale || "en");

  useEffect(() => {
    // Sync with cookie if available on client
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
      if (match && match[1] && (match[1] === "th" || match[1] === "en")) {
        setLocaleState(match[1]);
      }
    }
  }, []);

  const changeLocale = async (newLocale: string) => {
    setLocaleState(newLocale);
    if (typeof document !== "undefined") {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }
    try {
      await setServerLocale(newLocale);
    } catch (e) {
      console.error("Server locale error:", e);
    }
  };

  const dict = dictionaries[locale as Locale] || dictionaries.en;

  return (
    <I18nContext.Provider value={{ dict, locale, setLocale: changeLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
