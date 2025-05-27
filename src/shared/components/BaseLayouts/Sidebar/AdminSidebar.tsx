import { useEffect, useState } from "react";
import { GoHomeFill, GoSignOut, GoChevronLeft } from "react-icons/go";
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
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { authProvider } from "@/shared/utils/middleware/auth-provider";
import { toast } from "../../ui/toast";
import { SIDEBAR_STATE_KEY, useAdminSidebarState } from "@/shared/components/MainLayout/AdminLayout";
import { FaUser } from "react-icons/fa";
import { MdReport } from "react-icons/md";

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
  const { expanded, setExpanded, isSearchActive, setIsSearchActive } = useAdminSidebarState();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const pathSegments = pathname.split("/").filter(Boolean);

    if (pathSegments.length === 0) {
      setIsActive("home");
    } else if (pathSegments[0] === "admin" && pathSegments.length > 1) {
      setIsActive(`${pathSegments[0]}/${pathSegments[1]}`);
    } else {
      setIsActive(pathSegments[0]);
    }
  }, [pathname]);

  const handleActive = (active: string) => {
    setIsActive(active);
  };

  const toggleSidebar = () => {
    const newState = !expanded;
    setExpanded(newState);
    localStorage.setItem(SIDEBAR_STATE_KEY, String(newState));
  };

  const handleLanguageClick = () => {
    if (!expanded) {
      setIsSearchActive(false);
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

  return (
    <>
      <div
        className="fixed top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col justify-between transition-all duration-300 ease-in-out"
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
                isActive === "admin" ? "bg-primary-purple" : "hover:bg-gray-200"
              } transition-all duration-300`}
              onClick={() => {
                handleActive("admin");
                router.push("/admin");
              }}
            >
              <div className="flex justify-center items-center w-6 h-6">
                <GoHomeFill className={`w-6 h-6 ${isActive === "admin" && "text-white"}`} />
              </div>
              {expanded && (
                <LabelShadcn
                  text="common:path.home"
                  translate
                  className={`font-semibold cursor-pointer ${isActive === "admin" && "text-white"}`}
                />
              )}
            </div>

            <div
              className={`w-full flex gap-2 items-center p-3 rounded-md cursor-pointer ${
                isActive === "admin/user" ? "bg-primary-purple" : "hover:bg-gray-200"
              } transition-all duration-300`}
              onClick={() => {
                handleActive("admin/user");
                router.push("/admin/user");
              }}
            >
              <div className="flex justify-center items-center w-6 h-6">
                <FaUser className={`w-5 h-5 ${isActive === "admin/user" && "text-white"}`} />
              </div>
              {expanded && (
                <LabelShadcn
                  text="common:path.admin-user"
                  translate
                  className={`font-semibold cursor-pointer ${isActive === "admin/user" && "text-white"}`}
                />
              )}
            </div>

            <div
              className={`w-full flex gap-2 items-center p-3 rounded-md cursor-pointer ${
                isActive === "admin/report" ? "bg-primary-purple" : "hover:bg-gray-200"
              } transition-all duration-300`}
              onClick={() => {
                handleActive("admin/report");
                router.push("/admin/report");
              }}
            >
              <div className="flex justify-center items-center w-6 h-6">
                <MdReport className={`w-6 h-6 ${isActive === "admin/report" && "text-white"}`} />
              </div>
              {expanded && (
                <LabelShadcn
                  text="common:path.admin-report"
                  translate
                  className={`font-semibold cursor-pointer ${isActive === "admin/report" && "text-white"}`}
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

      {/* Trigger Button */}
      {!isSearchActive && (
        <button
          onClick={toggleSidebar}
          className="fixed top-5 z-20 rounded-full bg-white p-1.5 shadow-md border border-gray-200 transition-all duration-300"
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
