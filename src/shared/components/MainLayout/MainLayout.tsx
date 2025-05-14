"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageProvider } from "@/shared/hooks/useLanguage";
import { MainLayoutProps } from "@/shared/types/components-type/main-layout-type";
import Sidebar from "../BaseLayouts/Sidebar/Sidebar";
import { authProvider } from "@/shared/utils/middleware/auth-provider";
import { toast } from "@/shared/components/ui/toast";
import { useSocket } from "@/shared/hooks/use-socket";

const MainLayoutWrapper = ({ children }: MainLayoutProps) => {
  return (
    <div className="relative min-h-screen w-full bg-background-primary-purple">
      <div className="flex flex-col min-h-screen relative z-10 ">
        <LanguageProvider>
          <Sidebar />
          <div className="ml-[16rem] py-5">{children}</div>
        </LanguageProvider>
      </div>
    </div>
  );
};

const MainLayout = (props: MainLayoutProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { socket, isConnected } = useSocket();

  // Xử lý các sự kiện socket
  useEffect(() => {
    if (socket && isConnected) {
      console.log("Socket connected in MainLayout");

      // Đăng ký lắng nghe các sự kiện từ server
      socket.on("notification", (data) => {
        console.log("Received notification:", data);
        toast.success({
          title: "Thông báo mới",
          description: data.message,
        });
      });

      // Cleanup khi component unmount
      return () => {
        socket.off("notification");
      };
    }
  }, [socket, isConnected]);

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
      // Nếu xác thực thành công, đảm bảo socket được kết nối với ID người dùng thực
      if (socket && isConnected) {
        const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
        if (userId) {
          socket.emit("authenticate", userId);
          console.log("User authenticated with socket:", userId);
        }
      }

      setTimeout(() => {
        setIsAuthenticated(true);
      }, 1000);
    }
  };

  useEffect(() => {
    checkInitialState();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      {isAuthenticated ? <MainLayoutWrapper {...props} /> : <p>Loading...</p>}
      {isConnected && <div className="hidden">Socket connected</div>}
    </>
  );
};

export default MainLayout;
