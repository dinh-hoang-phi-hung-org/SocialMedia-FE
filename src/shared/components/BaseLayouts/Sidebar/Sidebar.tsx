import { useEffect, useState } from "react";
import { GoHomeFill, GoBellFill, GoSignOut } from "react-icons/go";
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

  useEffect(() => {
    if (pathname.split("/")[1]) {
      setIsActive(pathname.split("/")[1]);
    } else {
      setIsActive("home");
    }
  }, [pathname]);

  const handleActive = (active: string) => {
    setIsActive(active);
  };

  return (
    <div className="fixed top-0 left-0 w-[16rem] bg-white h-screen flex border-r border-gray-200 flex-col justify-between">
      <div className="flex flex-col gap-2 px-3">
        <div className="cursor-pointer" onClick={() => router.push("/")}>
          <Image src="/assets/images/logo.png" alt="logo" width={120} height={120} />
        </div>
        <div
          className={`w-full flex gap-2 items-center p-3 rounded-md cursor-pointer ${isActive === "home" ? "bg-primary-purple" : "hover:bg-gray-200"} transition-all duration-300`}
          onClick={() => handleActive("home")}
        >
          <div className="w-8">
            <GoHomeFill className={`w-6 h-6 ${isActive === "home" && "text-white"}`} />
          </div>
          <LabelShadcn
            text="common:path.home"
            translate
            className={`font-semibold cursor-pointer ${isActive === "home" && "text-white"}`}
          />
        </div>
        <div
          className={`w-full flex gap-2 items-center p-3 rounded-md cursor-pointer ${isActive === "search" ? "bg-primary-purple" : "hover:bg-gray-200"} transition-all duration-300`}
          onClick={() => handleActive("search")}
        >
          <div className="w-8">
            <FaSearch className={`w-5 h-5 ${isActive === "search" && "text-white"}`} />
          </div>
          <LabelShadcn
            text="common:path.search"
            translate
            className={`font-semibold cursor-pointer ${isActive === "search" && "text-white"}`}
          />
        </div>
        <div
          className={`w-full flex gap-2 items-center p-3 rounded-md cursor-pointer ${isActive === "message" ? "bg-primary-purple" : "hover:bg-gray-200"} transition-all duration-300`}
          onClick={() => {
            handleActive("message");
            router.push("/message");
          }}
        >
          <div className="w-8">
            <FaCommentAlt className={`w-5 h-5 ${isActive === "message" && "text-white"}`} />
          </div>
          <LabelShadcn
            text="common:path.message"
            translate
            className={`font-semibold cursor-pointer ${isActive === "message" && "text-white"}`}
          />
        </div>
        <div
          className={`w-full flex gap-2 items-center p-3 rounded-md cursor-pointer ${isActive === "notification" ? "bg-primary-purple" : "hover:bg-gray-200"} transition-all duration-300`}
          onClick={() => handleActive("notification")}
        >
          <div className="w-8">
            <GoBellFill className={`w-6 h-6 ${isActive === "notification" && "text-white"}`} />
          </div>
          <LabelShadcn
            text="common:path.notification"
            translate
            className={`font-semibold cursor-pointer ${isActive === "notification" && "text-white"}`}
          />
        </div>
        <div
          className={`w-full flex gap-2 items-center p-3 rounded-md cursor-pointer ${isActive === "profile" ? "bg-primary-purple" : "hover:bg-gray-200"} transition-all duration-300`}
          onClick={() => {
            handleActive("profile");
            router.push("/profile");
          }}
        >
          <div className="w-8">
            <Image
              src={store.getState().avatar.avatar || "/assets/images/sample-avatar.jpeg"}
              alt="avatar"
              width={28}
              height={28}
              className="rounded-full border border-gray-300"
            />
          </div>
          <LabelShadcn
            text="common:path.profile"
            translate
            className={`font-semibold cursor-pointer ${isActive === "profile" && "text-white"}`}
          />
        </div>
      </div>

      <div className="mb-6 px-3 flex flex-col gap-3">
        {/* Language Switcher */}
        <div className="relative">
          <div
            className={`w-full flex gap-2 items-center p-3 rounded-md cursor-pointer hover:bg-gray-200 transition-all duration-300 group`}
          >
            <div className="relative">
              <LanguagesIcon className={`w-5 h-5`} />
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

            <DropdownMenu>
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
                      }}
                    />
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Logout Button */}
        <div className="w-full flex gap-1 items-center p-3 hover:bg-gray-100 rounded-md cursor-pointer">
          <GoSignOut className="w-6 h-6" />
          <LabelShadcn text="common:text.logout" translate className="font-semibold" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
