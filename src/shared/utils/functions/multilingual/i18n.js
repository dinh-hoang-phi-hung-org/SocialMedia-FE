"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

const initI18n = async () => {
  await i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
      fallbackLng: "en",
      supportedLngs: ["en", "vi"],
      lng: "en",
      debug: false,
      interpolation: {
        escapeValue: false,
      },
      ns: ["common", "user-management", "report-management", "message", "admin"],
      defaultNS: "common",
      backend: {
        loadPath: "/locales/{{lng}}/{{ns}}.json",
      },
      react: {
        useSuspense: false,
        bindI18n: "languageChanged loaded",
        bindI18nStore: "added removed",
      },
    });

  // Explicitly load all namespaces for both languages
  await Promise.all([
    i18n.loadNamespaces(["common", "user-management", "report-management", "message", "admin"]),
    i18n.loadLanguages(["en", "vi"]),
  ]);

  return i18n;
};

export { initI18n };
export default i18n;
