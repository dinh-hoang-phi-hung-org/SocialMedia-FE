"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useTranslation } from "next-i18next";
import { usePathname } from "next/navigation";

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "app_language";

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const pathname = usePathname();

  // Initialize language from sessionStorage
  useEffect(() => {
    const savedLanguage = sessionStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage && savedLanguage !== currentLanguage) {
      i18n.changeLanguage(savedLanguage);
      setCurrentLanguage(savedLanguage);
    } else {
      const defaultLanguage = i18n.language || "en";
      i18n.changeLanguage(defaultLanguage as string);
      setCurrentLanguage(defaultLanguage as string);
    }
  }, [currentLanguage, i18n]);

  // Apply language change on route change
  useEffect(() => {
    const savedLanguage = sessionStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
      setCurrentLanguage(savedLanguage);
    }
  }, [pathname, i18n]);

  // Change language and save it in sessionStorage
  const changeLanguage = async (lang: string) => {
    if (lang !== currentLanguage) {
      await i18n.changeLanguage(lang);
      setCurrentLanguage(lang);
      sessionStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
  };

  return <LanguageContext.Provider value={{ currentLanguage, changeLanguage }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
