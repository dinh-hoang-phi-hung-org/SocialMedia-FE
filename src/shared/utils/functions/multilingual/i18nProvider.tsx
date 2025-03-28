"use client";

import { useEffect, useState } from "react";
import { initI18n } from "@/shared/utils/functions/multilingual/i18n";

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initI18n();
      setIsInitialized(true);
    };
    init();
  }, []);

  if (!isInitialized) {
    return null; // or a loading component
  }

  return <>{children}</>;
}
