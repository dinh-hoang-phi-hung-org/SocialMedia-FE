import { useEffect, useState } from "react";
import { GoHomeFill, GoBellFill, GoSignOut, GoChevronLeft } from "react-icons/go";
import { FaCommentAlt, FaSearch } from "react-icons/fa";
import { LanguagesIcon } from "lucide-react";
import LabelShadcn from "../../ui/LabelShadcn";
import Image from "next/image";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { store } from "@/shared/redux/store";
import { useSidebarState, SIDEBAR_STATE_KEY } from "../../MainLayout/MainLayout";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { authProvider } from "@/shared/utils/middleware/auth-provider";
import { toast } from "../../ui/toast";

const SIDEBAR_WIDTH_EXPANDED = "16rem";
const SIDEBAR_WIDTH_COLLAPSED = "4.5rem";

// Language flag component
const LanguageFlag = ({ language }: { language: string }) => {
  return (
    <div className="rounded-full overflow-hidden w-6 h-6 border-2 border-white shadow-md">
      <Image
        src={`/assets/flags/${language}.svg`}
        alt={`${language} flag`}
        className="w-full h-full object-cover"
        width={24}
        height={24}
      />
    </div>
  );
};

const Sidebar = () => {
  const [isActive, setIsActive] = useState("Home");
  const router = useRouter();
  const { changeLanguage, currentLanguage } = useLanguage();
  const pathname = usePathname();
  const {
    expanded,
    setExpanded,
    isSearchActive,
    setIsSearchActive,
    isNotificationActive,
    setIsNotificationActive,
    unreadCount,
  } = useSidebarState();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const pathSegments = pathname.split("/");
    if (pathSegments[1]) {
      if (pathSegments[1] === "profile" && pathSegments[2]) {
        setIsActive("");
      } else {
        setIsActive(pathSegments[1]);
      }
    } else {
      setIsActive("home");
    }
  }, [pathname]);

  const handleActive = (active: string) => {
    setIsActive(active);
    if (active === "notification") {
      setIsNotificationActive(true);
    }
    if (active === "search") {
      setIsSearchActive(true);
    }
  };

  const toggleSidebar = () => {
    const newState = !expanded;
    setExpanded(newState);
    localStorage.setItem(SIDEBAR_STATE_KEY, String(newState));
  };

  const handleLanguageClick = () => {
    if (!expanded) {
      setIsSearchActive(false);
      setIsNotificationActive(false);
      setExpanded(true);
      localStorage.setItem(SIDEBAR_STATE_KEY, "true");
      setTimeout(() => {
        setDropdownOpen(true);
      }, 300);
    }
  };

  const handleLogout = async () => {
    const logout = await TypeTransfer["Auth"]?.otherAPIs?.logout();
    if (logout?.payload) {
      router.push("/auth");
      toast.success({
        title: "common:notification.success",
        description: "common:message.logout-success",
      });
      authProvider.clearTokens();
      localStorage.setItem(SIDEBAR_STATE_KEY, "true");
    }
  };

  const handleSearchClick = () => {
    // Toggle search panel instead of navigating
    setIsActive("search");
    setIsSearchActive(!isSearchActive);
    if (isNotificationActive) {
      setIsNotificationActive(false);
    }
  };

  const handleNotificationClick = () => {
    setIsActive("notification");
    setIsNotificationActive(!isNotificationActive);
    if (isSearchActive) {
      setIsSearchActive(false);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className="hidden xl:flex fixed top-0 left-0 h-screen bg-white border-r border-gray-200 flex-col justify-between transition-all duration-300 ease-in-out"
        style={{
          width: expanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED,
        }}
      >
        <div className="flex flex-col">
          <div className="cursor-pointer flex" onClick={() => router.push("/")}>
            <Image
              src="/assets/images/logo.png"
              alt="logo"
              width={expanded ? 120 : 80}
              height={expanded ? 120 : 80}
              className="transition-all duration-300"
            />
          </div>

          <div className="flex flex-col gap-2 px-3">
            <div
              className={`w-full flex gap-2 items-center p-3 rounded-md cursor-pointer ${
                isActive === "home" ? "bg-primary-purple" : "hover:bg-gray-200"
              } transition-all duration-300`}
              onClick={() => {
                handleActive("home");
                router.push("/");
              }}
            >
              <div className="flex justify-center items-center w-6 h-6">
                <GoHomeFill className={`w-6 h-6 ${isActive === "home" && "text-white"}`} />
              </div>
              {expanded && (
                <LabelShadcn
                  text="common:path.home"
                  translate
                  className={`font-semibold cursor-pointer ${isActive === "home" && "text-white"}`}
                />
              )}
            </div>

            <div
              className={`w-full flex gap-2 items-center p-3 rounded-md cursor-pointer ${
                isActive === "search" ? "bg-primary-purple" : "hover:bg-gray-200"
              } transition-all duration-300`}
              onClick={handleSearchClick}
            >
              <div className="flex justify-center items-center w-6 h-6">
                <FaSearch className={`w-5 h-5 ${isActive === "search" && "text-white"}`} />
              </div>
              {expanded && (
                <LabelShadcn
                  text="common:path.search"
                  translate
                  className={`font-semibold cursor-pointer ${isActive === "search" && "text-white"}`}
                />
              )}
            </div>

            <div
              className={`w-full flex gap-2 items-center p-3 rounded-md cursor-pointer ${
                isActive === "message" ? "bg-primary-purple" : "hover:bg-gray-200"
              } transition-all duration-300`}
              onClick={() => {
                handleActive("message");
                router.push("/message");
              }}
            >
              <div className="flex justify-center items-center w-6 h-6">
                <FaCommentAlt className={`w-5 h-5 ${isActive === "message" && "text-white"}`} />
              </div>
              {expanded && (
                <LabelShadcn
                  text="common:path.message"
                  translate
                  className={`font-semibold cursor-pointer ${isActive === "message" && "text-white"}`}
                />
              )}
            </div>

            <div
              className={`w-full flex gap-2 items-center p-3 rounded-md cursor-pointer ${
                isActive === "notification" ? "bg-primary-purple" : "hover:bg-gray-200"
              } transition-all duration-300`}
              onClick={handleNotificationClick}
            >
              <div className="flex justify-center items-center w-6 h-6 relative">
                <GoBellFill className={`w-5 h-5 ${isActive === "notification" && "text-white"}`} />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </div>
                )}
              </div>
              {expanded && (
                <LabelShadcn
                  text="common:path.notification"
                  translate
                  className={`font-semibold cursor-pointer ${isActive === "notification" && "text-white"}`}
                />
              )}
            </div>

            <div
              className={`w-full flex gap-2 items-center p-3 rounded-md cursor-pointer ${
                isActive === "profile" ? "bg-primary-purple" : "hover:bg-gray-200"
              } transition-all duration-300`}
              onClick={() => {
                handleActive("profile");
                router.push("/profile");
              }}
            >
              <div className="flex justify-center items-center ">
                <Image
                  src={store.getState().avatar.avatar || "/assets/images/sample-avatar.png"}
                  alt="avatar"
                  width={26}
                  height={26}
                  className="rounded-full border border-slate-50 w-7 h-7"
                />
              </div>
              {expanded && (
                <LabelShadcn
                  text="common:path.profile"
                  translate
                  className={`font-semibold cursor-pointer ${isActive === "profile" && "text-white"}`}
                />
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 px-3 flex flex-col gap-3">
          {/* Language Switcher */}
          <div className="relative">
            <div
              className={`w-full flex gap-2 items-center p-3 rounded-md cursor-pointer hover:bg-gray-200 transition-all duration-300 group`}
              onClick={!expanded ? handleLanguageClick : undefined}
            >
              <div className="flex justify-center items-center w-6 h-6 relative">
                <LanguagesIcon className="w-5 h-5" />
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-primary-purple rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                />
              </div>

              {expanded && (
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <div className="flex-grow flex justify-between items-center">
                      <LabelShadcn
                        text="common:language.title"
                        translate
                        className={`font-semibold cursor-pointer text-black`}
                      />
                      <LanguageFlag language={currentLanguage} />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    align="end"
                    sideOffset={5}
                    className="w-36 bg-white shadow-md p-2 rounded-md border border-gray-200"
                  >
                    <DropdownMenuRadioGroup value={currentLanguage}>
                      <DropdownMenuRadioItem
                        value="en"
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${currentLanguage === "en" ? "bg-blue-50" : "hover:bg-gray-50"}`}
                      >
                        <div className="w-5 h-5 rounded-full overflow-hidden">
                          <Image
                            src="/assets/flags/en.svg"
                            alt="English"
                            className="w-full h-full object-cover"
                            width={24}
                            height={24}
                          />
                        </div>
                        <LabelShadcn
                          text="common:language.en"
                          inheritedClass={true}
                          translate
                          onClick={() => {
                            changeLanguage("en");
                            setDropdownOpen(false);
                          }}
                        />
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem
                        value="vi"
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${currentLanguage === "vi" ? "bg-blue-50" : "hover:bg-gray-50"}`}
                      >
                        <div className="w-5 h-5 rounded-full overflow-hidden">
                          <Image
                            src="/assets/flags/vi.svg"
                            alt="Tiếng Việt"
                            className="w-full h-full object-cover"
                            width={24}
                            height={24}
                          />
                        </div>
                        <LabelShadcn
                          text="common:language.vi"
                          inheritedClass={true}
                          translate
                          onClick={() => {
                            changeLanguage("vi");
                            setDropdownOpen(false);
                          }}
                        />
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <div
            className="w-full flex gap-2 items-center p-3 hover:bg-gray-100 rounded-md cursor-pointer"
            onClick={handleLogout}
          >
            <div className="flex justify-center items-center w-6 h-6">
              <GoSignOut className="w-5 h-5" />
            </div>
            {expanded && <LabelShadcn text="common:text.logout" translate className="font-semibold" />}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="flex justify-around items-center">
          {/* Home */}
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
              isActive === "home" ? "bg-primary-purple" : "hover:bg-gray-100"
            }`}
            onClick={() => {
              handleActive("home");
              router.push("/");
            }}
          >
            <GoHomeFill className={`w-6 h-6 ${isActive === "home" ? "text-white" : "text-gray-600"}`} />
          </button>

          {/* Search */}
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
              isActive === "search" ? "bg-primary-purple" : "hover:bg-gray-100"
            }`}
            onClick={handleSearchClick}
          >
            <FaSearch className={`w-5 h-5 ${isActive === "search" ? "text-white" : "text-gray-600"}`} />
          </button>

          {/* Message */}
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
              isActive === "message" ? "bg-primary-purple" : "hover:bg-gray-100"
            }`}
            onClick={() => {
              handleActive("message");
              router.push("/message");
            }}
          >
            <FaCommentAlt className={`w-5 h-5 ${isActive === "message" ? "text-white" : "text-gray-600"}`} />
          </button>

          {/* Notification */}
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 relative ${
              isActive === "notification" ? "bg-primary-purple" : "hover:bg-gray-100"
            }`}
            onClick={handleNotificationClick}
          >
            <GoBellFill className={`w-5 h-5 ${isActive === "notification" ? "text-white" : "text-gray-600"}`} />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            )}
          </button>

          {/* Profile */}
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
              isActive === "profile" ? "bg-primary-purple" : "hover:bg-gray-100"
            }`}
            onClick={() => {
              handleActive("profile");
              router.push("/profile");
            }}
          >
            <Image
              src={store.getState().avatar.avatar || "/assets/images/sample-avatar.png"}
              alt="avatar"
              width={24}
              height={24}
              className="rounded-full border border-slate-50"
            />
          </button>

          {/* Language Switcher */}
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 relative">
                <LanguagesIcon className="w-5 h-5 text-gray-600" />
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-primary-purple rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="center"
              sideOffset={10}
              className="w-36 bg-white shadow-lg p-2 rounded-md border border-gray-200 mb-2"
            >
              <DropdownMenuRadioGroup value={currentLanguage}>
                <DropdownMenuRadioItem
                  value="en"
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${currentLanguage === "en" ? "bg-blue-50" : "hover:bg-gray-50"}`}
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden">
                    <Image
                      src="/assets/flags/en.svg"
                      alt="English"
                      className="w-full h-full object-cover"
                      width={24}
                      height={24}
                    />
                  </div>
                  <LabelShadcn
                    text="common:language.en"
                    inheritedClass={true}
                    translate
                    onClick={() => {
                      changeLanguage("en");
                      setDropdownOpen(false);
                    }}
                  />
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="vi"
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${currentLanguage === "vi" ? "bg-blue-50" : "hover:bg-gray-50"}`}
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden">
                    <Image
                      src="/assets/flags/vi.svg"
                      alt="Tiếng Việt"
                      className="w-full h-full object-cover"
                      width={24}
                      height={24}
                    />
                  </div>
                  <LabelShadcn
                    text="common:language.vi"
                    inheritedClass={true}
                    translate
                    onClick={() => {
                      changeLanguage("vi");
                      setDropdownOpen(false);
                    }}
                  />
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Logout */}
          <button
            className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
            onClick={handleLogout}
          >
            <GoSignOut className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Desktop Trigger Button */}
      {!isSearchActive && !isNotificationActive && (
        <button
          onClick={toggleSidebar}
          className="hidden xl:block fixed top-5 z-20 rounded-full bg-white p-1.5 shadow-md border border-gray-200 transition-all duration-300"
          style={{
            left: expanded ? "17rem" : "5rem",
          }}
        >
          <GoChevronLeft className={`h-4 w-4 transition-transform duration-200 ${!expanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </>
  );
};

export default Sidebar;
