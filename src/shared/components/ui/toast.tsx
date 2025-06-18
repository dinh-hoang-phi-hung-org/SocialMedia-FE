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
        <LabelShadcn text={description} translate inheritedClass className="text-white/90" splitAndTranslate />
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
        background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)",
        border: "1px solid rgba(59, 130, 246, 0.3)",
        backdropFilter: "blur(12px)",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
        color: "white",
      },
    });
  },

  error: (props: ToastProps) => {
    toastSonner.error(createToastContent(props).title, {
      description: createToastContent(props).description,
      ...defaultConfig,
      style: {
        background: "linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #d946ef 100%)",
        border: "1px solid rgba(244, 63, 94, 0.3)",
        backdropFilter: "blur(12px)",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(244, 63, 94, 0.3)",
        color: "white",
      },
    });
  },

  info: (props: ToastProps) => {
    toastSonner.info(createToastContent(props).title, {
      description: createToastContent(props).description,
      ...defaultConfig,
      style: {
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
        border: "1px solid rgba(139, 92, 246, 0.3)",
        backdropFilter: "blur(12px)",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(139, 92, 246, 0.3)",
        color: "white",
      },
    });
  },
};
