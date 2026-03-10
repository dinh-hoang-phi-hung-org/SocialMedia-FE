"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { authProvider } from "@/shared/utils/middleware/auth-provider";
import { setTokensInfo } from "@/app/auth/_services/auth-tokens-info";
import { toast } from "@/shared/components/ui/toast";

const GoogleLoginButton = ({ className }: { className?: string }) => {
  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      try {
        const response = await TypeTransfer["Auth"]?.otherAPIs?.googleLogin(codeResponse.code);

        if (response?.success) {
          authProvider.setToken(response.payload.accessToken);
          setTokensInfo(response.payload);

          window.location.href = "/";
        } else {
          toast.error({
            title: "Login failed",
            description: response?.payload?.message,
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <button
      onClick={() => googleLogin()}
      className={`flex justify-center border-2 border-gray-200 rounded-xl px-6 py-3 w-full gap-3 items-center text-sm font-semibold bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-red-50 hover:border-blue-300 transition-all duration-300 transform hover:shadow-lg group cursor-pointer ${className}`}
    >
      <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 " />
      Continue with Google
    </button>
  );
};

export default GoogleLoginButton;
