"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageProvider } from "@/shared/hooks/useLanguage";
import { MainLayoutProps } from "@/shared/types/components-type/main-layout-type";
import { authProvider } from "@/shared/utils/middleware/auth-provider";
import { toast } from "@/shared/components/ui/toast";
import { useSocket } from "@/shared/hooks/use-socket";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { store } from "@/shared/redux/store";
import { Provider } from "react-redux";
import { setAvatar } from "@/shared/redux/slices/avatarSlice";
import Search from "../BaseLayouts/Search/Search";
import AdminSidebar from "../BaseLayouts/Sidebar/AdminSidebar";

const SIDEBAR_WIDTH_EXPANDED = "16rem";
const SIDEBAR_WIDTH_COLLAPSED = "4.5rem";
const SEARCH_PANEL_WIDTH = "20rem";
export const SIDEBAR_STATE_KEY = "sidebar_expanded";

interface AdminSidebarStateContextType {
    expanded: boolean;
    setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    isSearchActive: boolean;
    setIsSearchActive: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdminSidebarStateContext = React.createContext<AdminSidebarStateContextType | undefined>(undefined);

export const useAdminSidebarState = (): AdminSidebarStateContextType => {
    const context = React.useContext(AdminSidebarStateContext);
    if (context === undefined) {
        throw new Error("useAdminSidebarState must be used within a AdminSidebarStateProvider");
    }
    return context;
};

const AdminLayoutWrapper = ({ children }: MainLayoutProps) => {
    // Initialize from localStorage if available, otherwise default to true
    const [expanded, setExpanded] = useState(() => {
        if (typeof window !== "undefined") {
            const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
            return savedState === null ? true : savedState === "true";
        }
        return true;
    });

    const [isSearchActive, setIsSearchActive] = useState(false);

    // When search is activated, ensure sidebar is collapsed
    useEffect(() => {
        if (isSearchActive && expanded) {
            setExpanded(false);
        }
    }, [isSearchActive]);

    return (
        <div className="relative min-h-screen w-full bg-background-primary-purple">
            <div className="flex flex-col min-h-screen relative z-10">
                <AdminSidebarStateContext.Provider value={{ expanded, setExpanded, isSearchActive, setIsSearchActive }}>
                    <LanguageProvider>
                        <AdminSidebar />

                        {/* Search Panel */}
                        <div
                            className="fixed top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out"
                            style={{
                                width: isSearchActive ? SEARCH_PANEL_WIDTH : "0",
                                transform: isSearchActive ? `translateX(${SIDEBAR_WIDTH_COLLAPSED})` : "translateX(0)",
                                opacity: isSearchActive ? 1 : 0,
                                overflow: "hidden",
                                zIndex: isSearchActive ? 9 : -1,
                            }}
                        >
                            {isSearchActive && <Search />}
                        </div>

                        <div
                            className="py-5 transition-all duration-300 ease-in-out"
                            style={{
                                marginLeft: expanded
                                    ? SIDEBAR_WIDTH_EXPANDED
                                    : isSearchActive
                                        ? `calc(${SIDEBAR_WIDTH_COLLAPSED} + ${SEARCH_PANEL_WIDTH})`
                                        : SIDEBAR_WIDTH_COLLAPSED,
                            }}
                        >
                            {children}
                        </div>
                    </LanguageProvider>
                </AdminSidebarStateContext.Provider>
            </div>
        </div>
    );
};

const AdminLayout = (props: MainLayoutProps) => {
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
        const redirectPath = await authProvider.checkAdmin();
        if (redirectPath.path && redirectPath.path !== "/admin" && redirectPath.path !== "") {
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
            {isAuthenticated ? (
                <Provider store={store}>
                    {/* <PersistGate loading={null} persistor={persistor}> */}
                    <AdminLayoutWrapper {...props} />
                    {/* </PersistGate> */}
                </Provider>
            ) : (
                <p>Loading...</p>
            )}
            {isConnected && <div className="hidden">Socket connected</div>}
        </>
    );
};

export default AdminLayout;
