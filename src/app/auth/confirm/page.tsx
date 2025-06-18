"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UnAuthLayout from "@/shared/components/MainLayout/UnAuthLayout";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { toast } from "@/shared/components/ui/toast";
import { CheckCircle, XCircle, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import Overlay from "@/shared/components/BaseLayouts/Overlay/Overlay";

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifyAccount = async () => {
      if (!token) {
        toast.error({
          title: "common:message.verification-failed",
          description: "common:message.invalid-verification-link",
        });
        setIsVerifying(false);
        return;
      }

      try {
        // Add a small delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const response = await TypeTransfer["Auth"].otherAPIs?.verifyEmail(token);

        if (response?.success) {
          setIsSuccess(true);
          toast.success({
            title: "common:message.verification-success",
            description: "common:auth.verification-success",
          });
        } else {
          toast.error({
            title: "common:message.verification-failed",
            description: "common:auth.verification-failed",
          });
        }
      } catch {
        toast.error({
          title: "common:message.verification-failed",
          description: "common:message.error-occurred",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAccount();
  }, [token, router]);

  const handleRedirect = () => {
    router.push("/auth");
  };

  const handleRetry = () => {
    setIsVerifying(true);
    setIsSuccess(false);
    // Trigger verification again
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(false);
    }, 2000);
  };

  return (
    <UnAuthLayout>
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-50">
        {/* Background Image with repeat pattern */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: "url('/assets/images/background.webp')",
            backgroundSize: "400px 400px",
            backgroundRepeat: "repeat",
            backgroundPosition: "0 0",
          }}
        ></div>

        <Overlay />

        <div className="relative z-10 w-full max-w-md mx-auto p-6">
          <div className="bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8 auth-container">
            <div className="flex justify-center mb-6">
              {isVerifying ? (
                <div className="relative">
                  <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-gray-200/30">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-pulse"></div>
                </div>
              ) : isSuccess ? (
                <div className="relative">
                  <div className="w-20 h-20 bg-green-50/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-green-200/30">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-green-200/20 rounded-full animate-pulse"></div>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-20 h-20 bg-red-50/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-red-200/30">
                    <XCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-red-200/20 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>

            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2 drop-shadow-sm">
                {isVerifying ? "Verifying Account" : isSuccess ? "Verification Successful!" : "Verification Failed"}
              </h1>
              <p className="text-gray-600 drop-shadow-sm">
                {isVerifying
                  ? "Please wait while we verify your account..."
                  : isSuccess
                    ? "Your account has been successfully verified. You can now log in."
                    : "We couldn't verify your account. The link may be expired or invalid."}
              </p>
            </div>

            {isVerifying && (
              <div className="mb-6">
                <div className="w-full bg-gray-200/60 backdrop-blur-sm rounded-full h-2 shadow-inner">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-loading-progress shadow-sm"></div>
                </div>
                <p className="text-center text-gray-600 text-sm mt-2 drop-shadow-sm">Verifying your email address...</p>
              </div>
            )}

            {!isVerifying && (
              <div className="space-y-4">
                <Button
                  onClick={handleRedirect}
                  className="
                    w-full h-12 
                    bg-gradient-to-r from-blue-500 to-purple-600 
                    hover:from-blue-600 hover:to-purple-700
                    border-0 rounded-xl 
                    font-semibold text-white
                    transition-all duration-300 
                    transform hover:scale-[1.02] active:scale-[0.98]
                    shadow-lg hover:shadow-xl
                    backdrop-blur-sm
                    group
                  "
                >
                  <div className="flex items-center justify-center space-x-2">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>{isSuccess ? "Go to Login" : "Back to Auth"}</span>
                  </div>
                </Button>

                {!isSuccess && (
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    className="
                      w-full h-12 
                      bg-white/60 backdrop-blur-sm 
                      border border-gray-300/60 hover:bg-white/80 
                      text-gray-700 rounded-xl
                      transition-all duration-300
                      shadow-md hover:shadow-lg
                      group
                    "
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4 transition-transform group-hover:rotate-180" />
                      <span>Try Again</span>
                    </div>
                  </Button>
                )}
              </div>
            )}

            {/* Help text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need help?{" "}
                <button
                  type="button"
                  className="text-blue-600 underline hover:text-blue-700 transition-colors duration-300"
                  onClick={() => {
                    // Add contact support logic
                  }}
                >
                  Contact Support
                </button>
              </p>
            </div>
          </div>

          {/* Footer decoration */}
          <div className="text-center mt-8 text-gray-700">
            <p className="text-sm font-medium drop-shadow-sm">Email Verification</p>
          </div>
        </div>
      </div>
    </UnAuthLayout>
  );
}
