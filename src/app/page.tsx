"use client";

import { Label } from "@radix-ui/react-label";
import { useTranslation } from "next-i18next";
import Header from "@/shared/components/BaseLayouts/Header/Header";

export default function Home() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col w-full">
      <Header />
      <Label>{t("common:text.actions")}</Label>
    </div>
  );
}
