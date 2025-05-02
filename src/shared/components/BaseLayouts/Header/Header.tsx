import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { LanguagesIcon } from "lucide-react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";

const Header = () => {
  const { changeLanguage } = useLanguage();
  return (
    <header className="sticky top-0 right-0 left-0 z-50 bg-black h-[64px] w-full">
      <div className="h-full flex items-center justify-center">
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
