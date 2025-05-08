"use client";

import * as React from "react";
import { Label as LabelRadix } from "@/shared/components/ui/label";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/shared/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { LabelProps } from "@/shared/types/components-type/label-type";

const LabelShadcn = (props: LabelProps) => {
  const { t: translateFn } = useTranslation(["common"]);
  const translatedText = props.translate ? (props.t ? props.t(props.text) : translateFn(props.text)) : props.text;
  const shouldTruncate = props.truncate && translatedText.length > (props.truncateLength ?? 50);
  const displayedText = shouldTruncate ? `${translatedText.slice(0, props.truncateLength ?? 50)}...` : translatedText;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <LabelRadix
            htmlFor={props.htmlFor}
            className={`
                relative custom-label
                ${props.onClick ? "cursor-pointer" : ""}
                ${props.inheritedClass ? "" : "block font-medium text-base text-gray-700"}
                ${props.className}
              )`}
            onClick={props.onClick}
          >
            {displayedText}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </LabelRadix>
        </TooltipTrigger>
        {(props.fullTextSpanOnHover || shouldTruncate) && <TooltipContent side="top">{translatedText}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
};

LabelShadcn.displayName = "LabelShadcn";

export default LabelShadcn;
