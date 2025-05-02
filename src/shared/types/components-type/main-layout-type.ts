import { ComponentDefaultProps } from "@/shared/types/components-type/component-default-type";
import { PropsWithChildren } from "react";

export type MainLayoutProps = ComponentDefaultProps &
  PropsWithChildren & {
    title?: string;
    maxWidthPercentage?: number;
    containerClassName?: string;
    bgImage?: string;
  };
