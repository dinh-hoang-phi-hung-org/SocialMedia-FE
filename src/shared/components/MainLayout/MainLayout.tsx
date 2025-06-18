"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LanguageProvider } from "@/shared/hooks/useLanguage";
import { MainLayoutProps } from "@/shared/types/components-type/main-layout-type";
import Sidebar from "../BaseLayouts/Sidebar/Sidebar";
import { authProvider } from "@/shared/utils/middleware/auth-provider";
import { toast } from "@/shared/components/ui/toast";
import { useSocket } from "@/shared/hooks/use-socket";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { store } from "@/shared/redux/store";
import { Provider } from "react-redux";
import { setAvatar } from "@/shared/redux/slices/avatarSlice";
import Search from "../BaseLayouts/Search/Search";
import Loading from "../BaseLayouts/Loading/Loading";
import Notification from "../BaseLayouts/Notification/Notification";
import { TNotification } from "@/shared/types/common-type/notification-type";

const SIDEBAR_WIDTH_EXPANDED = "16rem";
const SIDEBAR_WIDTH_COLLAPSED = "4.5rem";
const SEARCH_PANEL_WIDTH = "20rem";
export const SIDEBAR_STATE_KEY = "sidebar_expanded";

interface SidebarStateContextType {
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  isSearchActive: boolean;
  setIsSearchActive: React.Dispatch<React.SetStateAction<boolean>>;
  isNotificationActive: boolean;
  setIsNotificationActive: React.Dispatch<React.SetStateAction<boolean>>;
  notifications: TNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<TNotification[]>>;
  addNotification: (notification: TNotification) => void;
  unreadCount: number;
  markAsRead: (notificationUuid: string) => void;
}

const SidebarStateContext = React.createContext<SidebarStateContextType | undefined>(undefined);

export const useSidebarState = (): SidebarStateContextType => {
  const context = React.useContext(SidebarStateContext);
  if (context === undefined) {
    throw new Error("useSidebarState must be used within a SidebarStateProvider");
  }
  return context;
};

const MainLayoutWrapper = ({ children }: MainLayoutProps) => {
  const [expanded, setExpanded] = useState(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
      return savedState === null ? true : savedState === "true";
    }
    return true;
  });

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isNotificationActive, setIsNotificationActive] = useState(false);
  const [notifications, setNotifications] = useState<TNotification[]>([]);
  const { socket, isConnected } = useSocket();

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const addNotification = useCallback((notification: TNotification) => {
    setNotifications((prev) => {
      const exists = prev.some((n) => n.uuid === notification.uuid);
      if (exists) {
        console.log("⚠️ Notification already exists, skipping:", notification.uuid);
        return prev;
      }
      return [notification, ...prev];
    });
  }, []);

  const markAsRead = useCallback((notificationUuid: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.uuid === notificationUuid ? { ...notification, isRead: true } : notification,
      ),
    );
  }, []);

  useEffect(() => {
    if (isSearchActive && expanded) {
      setExpanded(false);
    }
  }, [isSearchActive]);

  useEffect(() => {
    if (isNotificationActive && expanded) {
      setExpanded(false);
    }
  }, [isNotificationActive]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await TypeTransfer["Notification"]?.otherAPIs?.getNotifications({
          page: 1,
          limit: 50,
        });
        if (response?.success) {
          console.log("📋 Loaded initial notifications:", response.payload.data);
          setNotifications(response?.payload.data || []);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (socket && isConnected) {
      console.log("🔗 Socket connected in MainLayout");

      const userUuid = authProvider.getUserUuid();
      console.log("👤 User UUID for notifications:", userUuid);

      if (userUuid) {
        console.log("🔐 Authenticating and joining notifications for user:", userUuid);
        socket.emit("authenticate", userUuid);
        socket.emit("joinNotifications", userUuid);
      } else {
        console.log("⚠️ No user UUID found, cannot join notifications");
      }

      socket.on("newNotification", (notification: TNotification) => {
        toast.success({
          title: "notification:message.new-notification",
          description: `${notification.userRelated?.username} ${notification.content}`,
        });

        addNotification(notification);
      });

      socket.on("notification", (data) => {
        console.log("📢 Received generic notification:", data);
        toast.success({
          title: "notification:message.new-notification",
          description: data.message,
        });
      });

      socket.on("removedFromGroup", (data) => {
        console.log("❌ Removed from group:", data);
        toast.error({
          title: "common:notification.error",
          description: data.message || "message:group.removed-from-group",
        });

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      });

      socket.on("connect", () => {
        console.log("✅ Socket connected");
      });

      socket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
      });

      socket.on("authenticate", (response) => {
        console.log("🔐 Authentication response:", response);
      });

      socket.on("joinNotifications", (response) => {
        console.log("🔔 Join notifications response:", response);
      });

      return () => {
        if (userUuid) {
          socket.emit("leaveNotifications", userUuid);
        }
        socket.off("notification");
        socket.off("newNotification");
        socket.off("testEvent");
        socket.off("removedFromGroup");
        socket.off("connect");
        socket.off("disconnect");
        socket.off("authenticate");
        socket.off("joinNotifications");
      };
    }
  }, [socket, isConnected, addNotification]);

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="flex flex-col min-h-screen relative z-10">
        <SidebarStateContext.Provider
          value={{
            expanded,
            setExpanded,
            isSearchActive,
            setIsSearchActive,
            isNotificationActive,
            setIsNotificationActive,
            notifications,
            setNotifications,
            addNotification,
            unreadCount,
            markAsRead,
          }}
        >
          <LanguageProvider>
            <Sidebar />

            <div
              className="fixed top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out"
              style={{
                width: isSearchActive || isNotificationActive ? SEARCH_PANEL_WIDTH : "0",
                transform:
                  isSearchActive || isNotificationActive ? `translateX(${SIDEBAR_WIDTH_COLLAPSED})` : "translateX(0)",
                opacity: isSearchActive || isNotificationActive ? 1 : 0,
                overflow: "hidden",
                zIndex: isSearchActive || isNotificationActive ? 9 : -1,
              }}
            >
              {isSearchActive && <Search />}
              {isNotificationActive && <Notification />}
            </div>

            <div
              className="py-5 transition-all duration-300 ease-in-out"
              style={{
                marginLeft: expanded
                  ? SIDEBAR_WIDTH_EXPANDED
                  : isSearchActive || isNotificationActive
                    ? `calc(${SIDEBAR_WIDTH_COLLAPSED} + ${SEARCH_PANEL_WIDTH})`
                    : SIDEBAR_WIDTH_COLLAPSED,
              }}
            >
              {children}
            </div>
          </LanguageProvider>
        </SidebarStateContext.Provider>
      </div>
    </div>
  );
};

const MainLayout = (props: MainLayoutProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const checkAuthRedirect = async (): Promise<boolean> => {
    const redirectPath = await authProvider.checkUser();
    if (redirectPath.path && redirectPath.path !== "/" && redirectPath.path !== "") {
      toast.error({
        title: "common:text.error",
        description: redirectPath.message,
      });
      router.push(redirectPath.path);
      return false;
    } else {
      setIsAuthenticated(true);
      const me = await TypeTransfer["User"]?.otherAPIs?.getMe();
      if (me?.payload?.profilePictureUrl) {
        store.dispatch(setAvatar(me.payload.profilePictureUrl));
      }
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

  return (
    <>
      {isAuthenticated ? (
        <Provider store={store}>
          <MainLayoutWrapper {...props} />
        </Provider>
      ) : (
        <Loading />
      )}
    </>
  );
};

export default MainLayout;
