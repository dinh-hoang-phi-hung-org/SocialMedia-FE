"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageProvider } from "@/shared/hooks/useLanguage";
import { MainLayoutProps } from "@/shared/types/components-type/main-layout-type";
import Sidebar from "../BaseLayouts/Sidebar/Sidebar";
import { authProvider } from "@/shared/utils/middleware/auth-provider";
import { toast } from "@/shared/components/ui/toast";

const MainLayoutWrapper = ({ children }: MainLayoutProps) => {
  return (
    <div className="relative min-h-screen w-full bg-background-primary-purple">
      <div className="fixed inset-0 bg-repeat bg-center z-0" />
      <div className="fixed inset-0 bg-white bg-opacity-50 z-0"></div>

      <div className="flex flex-col min-h-screen relative z-10">
        <LanguageProvider>
          <div className="flex">
            <Sidebar />
            <div className="ml-[16rem] w-full py-5">{children}</div>
          </div>
        </LanguageProvider>
      </div>
    </div>
  );
};

const MainLayout = (props: MainLayoutProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const checkAuthRedirect = async (): Promise<boolean> => {
    const redirectPath = await authProvider.checkAuth();
    if (redirectPath.path && redirectPath.path !== "/" && redirectPath.path !== "") {
      toast.error({
        title: "common:text.error",
        description: redirectPath.message,
      });
      router.push(redirectPath.path);
      return false;
    } else {
      setIsAuthenticated(true);
      return true;
    }
  };

  const checkInitialState = async () => {
    const authRedirect = await checkAuthRedirect();
    if (authRedirect) {
      setTimeout(() => {
        setIsAuthenticated(true);
      }, 1000);
    }
  };

  useEffect(() => {
    checkInitialState();
    // eslint-disable-next-line
  }, []);

  return <>{isAuthenticated ? <MainLayoutWrapper {...props} /> : <p>Loading...</p>}</>;
};

export default MainLayout;
