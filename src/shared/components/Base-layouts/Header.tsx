import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { LanguagesIcon } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";
import LabelShadcn from "../ui/LabelShadcn";

const Header = () => {
  const { changeLanguage } = useLanguage();
  return (
    <header className="sticky right-0 top-0 justify-between z-10 p-6 pl-0 bg-black w-screen">
      <div className="flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <LanguagesIcon className="w-6 h-6 text-white" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-28 bg-white shadow-md p-2 rounded-md">
            <DropdownMenuRadioGroup>
              <DropdownMenuRadioItem value="top">
                <LabelShadcn
                  text="common:language.en"
                  inheritedClass={true}
                  translate
                  onClick={() => {
                    changeLanguage("en");
                  }}
                />
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="bottom">
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
    </header>
  );
};

export default Header;
