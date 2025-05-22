"use client";

import { LanguageProvider } from "@/shared/hooks/useLanguage";
import { MainLayoutProps } from "@/shared/types/components-type/main-layout-type";
import Image from "next/image";

const UnAuthLayoutWrapper = ({ children, bgImage = "/assets/images/background.webp" }: MainLayoutProps) => {
  return (
    <div className="relative min-h-screen w-full">
      {/* Background with overlay */}
      <div className="fixed inset-0 bg-repeat bg-center z-0" style={{ backgroundImage: `url(${bgImage})` }} />
      <div className="fixed inset-0 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm z-0"></div>

      {/* Content container */}
      <div className="flex flex-col min-h-screen relative z-10">
        <header className="py-6 px-8 flex justify-between items-center">
          <div className="flex items-center">
            <Image src="/assets/images/logo.png" alt="Logo" width={40} height={40} className="mr-2" />
            <h1 className="text-xl font-bold text-primary">MultilanguageWeb</h1>
          </div>
        </header>

        <LanguageProvider>
          <main className="flex flex-grow justify-center items-center px-4">
            <div className="w-full max-w-4xl">{children}</div>
          </main>
        </LanguageProvider>

        <footer className="py-4 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} MultilanguageWeb. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

const UnAuthLayout = (props: MainLayoutProps) => {
  return <UnAuthLayoutWrapper {...props} />;
};

export default UnAuthLayout;
