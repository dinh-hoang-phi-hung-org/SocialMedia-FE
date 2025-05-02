"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UnAuthLayout from "@/shared/components/MainLayout/UnAuthLayout";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { toast } from "@/shared/components/ui/toast";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";

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

  return (
    <UnAuthLayout>
      <div className="w-full h-full flex flex-col self-center items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <LabelShadcn
            translate
            text={
              isVerifying
                ? "common:message.verifying-account"
                : isSuccess
                  ? "common:message.verification-success"
                  : "common:message.verification-failed"
            }
            className="text-2xl font-bold text-center mb-6"
          />

          {isVerifying ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <LabelShadcn
                translate
                text={isSuccess ? "common:auth.verification-success" : "common:auth.verification-failed"}
                className="text-center mb-6 text-base"
              />

              <button
                onClick={handleRedirect}
                className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <LabelShadcn
                  translate
                  text={isSuccess ? "common:button.go-to-login" : "common:button.try-again"}
                  className="text-white"
                />
              </button>
            </>
          )}
        </div>
      </div>
    </UnAuthLayout>
  );
}
