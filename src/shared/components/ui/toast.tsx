import { toast as toastSonner } from "sonner";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";

interface ToastProps {
  title: string;
  description: string | React.ReactNode;
}

const defaultConfig = {
  position: "bottom-right" as const,
  duration: 3000,
};

const createToastContent = (props: ToastProps) => {
  const { title, description } = props;

  return {
    title: title ? <LabelShadcn text={title} translate className="text-white font-bold text-lg" /> : null,
    description:
      typeof description === "string" ? (
        <LabelShadcn text={description} translate className="text-white" />
      ) : (
        description
      ),
  };
};

export const toast = {
  success: (props: ToastProps) => {
    toastSonner.success(createToastContent(props).title, {
      description: createToastContent(props).description,
      ...defaultConfig,
      style: {
        backgroundColor: "var(--success)",
        color: "white",
      },
    });
  },

  error: (props: ToastProps) => {
    toastSonner.error(createToastContent(props).title, {
      description: createToastContent(props).description,
      ...defaultConfig,
      style: {
        backgroundColor: "var(--danger)",
        color: "white",
      },
    });
  },
};
