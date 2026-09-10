"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ currentLocale }: { currentLocale?: string }) {
  const { locale, setLocale } = useI18n();
  const activeLocale = currentLocale || locale;
  const isThai = activeLocale === "th";

  const toggleLanguage = () => {
    const nextLocale = isThai ? "en" : "th";
    setLocale(nextLocale);
  };

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      className={cn(
        "relative w-[86px] h-[38px] rounded-full border-[2.5px] border-[#2A2A2A] bg-white flex items-center px-1 focus:outline-none cursor-pointer transition-all shadow-xs hover:border-terracotta-500"
      )}
      aria-label="Toggle language"
      title={isThai ? "เปลี่ยนเป็น English" : "Switch to ภาษาไทย"}
    >
      <div
        className={cn(
          "flex items-center justify-center w-[28px] h-[28px] rounded-full text-[12px] font-bold text-white transition-transform duration-300 ease-in-out shadow-sm",
          isThai 
            ? "translate-x-0 bg-[#F47920]" 
            : "translate-x-[44px] bg-[#4A4A4A]"
        )}
      >
        {isThai ? "ไทย" : "eng"}
      </div>
    </button>
  );
}
