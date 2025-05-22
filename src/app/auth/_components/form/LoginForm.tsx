"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { authProvider } from "@/shared/utils/middleware/auth-provider";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { setTokensInfo } from "../../_services/auth-tokens-info";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";
import { useForm } from "react-hook-form";
import { Card } from "@/shared/components/ui/card";
import { LoginFormType, LoginRequest } from "@/shared/types/common-type/auth-type";
import { toast } from "@/shared/components/ui/toast";

export function LoginForm({ setToRegister }: Readonly<LoginFormType>) {
  const { t } = useTranslation();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState({
    email: false,
    password: false,
  });

  const form = useForm<LoginRequest>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const checkAuthen = async () => {
      const isAuth = await authProvider.checkAuth();
      if (isAuth.path && isAuth.path === "/") {
        router.push(isAuth.path);
      }
    };
    checkAuthen();
  }, [router]);

  async function onSubmit(values: LoginRequest) {
    const trimmedEmail = values.email.trim();

    if (!trimmedEmail) {
      toast.error({
        title: "common:message.login-failed",
        description: "common:auth.email-required",
      });
      setError({ ...error, email: true });
      return;
    }
    if (!values.password) {
      toast.error({
        title: "common:message.login-failed",
        description: "common:auth.password-required",
      });
      setError({ ...error, password: true });
      return;
    }

    try {
      const response = await TypeTransfer["Auth"].otherAPIs?.login({
        email: trimmedEmail,
        password: values.password,
      });
      if (response?.payload?.accessToken) {
        authProvider.setToken(response?.payload?.accessToken);
        setTokensInfo(response?.payload);
        router.push("/");
      }
      // eslint-disable-next-line
    } catch (error: any) {
      try {
        toast.error({
          title: "common:message.login-failed",
          description: error?.message || "common:auth.invalid-credentials",
        });
        setError({ email: true, password: true });
      } catch {
        setError({ email: true, password: true });
      }
    }
  }

  return (
    <Card className="w-[350px] h-full bg-white p-8 rounded-2xl shadow-lg">
      <LabelShadcn className="text-center text-inherit text-2xl font-bold mb-3" text="common:button.login" translate />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Username Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <LabelShadcn className="text-inherit" text="common:auth.email" inheritedClass translate />
                <FormControl>
                  <Input
                    className={`rounded-lg ${error.email ? "border-red-500" : ""} text-sm`}
                    placeholder={t("common:auth.enter-your-email")}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setError({ ...error, email: false });
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <LabelShadcn className="text-inherit" text="common:auth.password" inheritedClass translate />
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      className={`rounded-lg pr-10 ${error.password ? "border-red-500" : ""} text-sm`}
                      placeholder={t("common:auth.enter-your-password")}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setError({ ...error, password: false });
                      }}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </Button>
                </div>
              </FormItem>
            )}
          />

          {/* Login Button */}
          <Button variant="default" type="submit" className="w-full">
            <LabelShadcn className="text-inherit cursor-pointer font-semibold" text="common:auth.login" translate />
          </Button>

          <div className="text-center flex items-center justify-center gap-2">
            <LabelShadcn className="text-inherit" text="common:button.dont-have-account" inheritedClass translate />
            <Button
              type="button"
              className="cursor-pointer bg-transparent hover:opacity-70 p-0"
              onClick={() => setToRegister(true)}
              variant="ghost"
            >
              <LabelShadcn
                className="text-primary cursor-pointer font-semibold"
                text="common:auth.sign-up"
                inheritedClass
                translate
              />
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
