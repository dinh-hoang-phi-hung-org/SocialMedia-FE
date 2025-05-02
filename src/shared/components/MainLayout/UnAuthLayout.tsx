"use client";

import { LanguageProvider } from "@/shared/hooks/useLanguage";
import Header from "@/shared/components/BaseLayouts/Header/Header";
import { MainLayoutProps } from "@/shared/types/components-type/main-layout-type";

const UnAuthLayoutWrapper = ({ children, bgImage = "/assets/images/background.webp" }: MainLayoutProps) => {
  return (
    <div className="relative min-h-screen w-full">
      <div className="fixed inset-0 bg-repeat bg-center z-0" style={{ backgroundImage: `url(${bgImage})` }} />
      <div className="fixed inset-0 bg-white bg-opacity-50 z-0"></div>

      <div className="flex flex-col min-h-screen relative z-10">
        <LanguageProvider>
          <Header />
          <main className="flex flex-grow">{children}</main>
        </LanguageProvider>
      </div>
    </div>
  );
};

const UnAuthLayout = (props: MainLayoutProps) => {
  return <UnAuthLayoutWrapper {...props} />;
};

export default UnAuthLayout;
