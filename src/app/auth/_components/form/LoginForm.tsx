"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { authProvider } from "@/shared/utils/middleware/auth-provider";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { setTokensInfo } from "../../_services/auth-tokens-info";
import { useForm } from "react-hook-form";
import { LoginFormType, LoginRequest } from "@/shared/types/common-type/auth-type";
import { toast } from "@/shared/components/ui/toast";

export function LoginForm({ setToRegister }: Readonly<LoginFormType>) {
  const { t } = useTranslation();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      const isAuth = await authProvider.checkUser();
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

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-8 bg-transparent">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome</h1>
        <p className="text-gray-600">Please login to your account</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <FormControl>
                    <Input
                      className={`
                        pl-12 pr-4 py-3 h-12 
                        bg-white/60 backdrop-blur-sm 
                        border border-gray-300/60 
                        rounded-xl
                        text-gray-800 placeholder:text-gray-500
                        focus:bg-white/80 focus:border-blue-400
                        transition-all duration-300
                        ${error.email ? "border-red-400 bg-red-50/60" : ""}
                      `}
                      placeholder={t("common:auth.enter-your-email")}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setError({ ...error, email: false });
                      }}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      className={`
                        pl-12 pr-12 py-3 h-12 
                        bg-white/60 backdrop-blur-sm 
                        border border-gray-300/60 
                        rounded-xl
                        text-gray-800 placeholder:text-gray-500
                        focus:bg-white/80 focus:border-blue-400
                        transition-all duration-300
                        ${error.password ? "border-red-400 bg-red-50/60" : ""}
                      `}
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
                    className="absolute inset-y-0 right-0 top-1/2 -translate-y-1/2 hover:bg-gray-100/60 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </Button>
                </div>
              </FormItem>
            )}
          />

          <Button
            variant="default"
            type="submit"
            disabled={isLoading}
            className="
              w-full h-12 
              bg-gradient-to-r from-blue-500 to-purple-600 
              hover:from-blue-600 hover:to-purple-700
              border-0 rounded-xl 
              font-semibold text-white
              transition-all duration-300 
              transform hover:scale-[1.02] active:scale-[0.98]
              disabled:opacity-70 disabled:cursor-not-allowed
              shadow-lg hover:shadow-xl
              group
            "
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            )}
          </Button>

          <div className="text-center">
            <span className="text-gray-600">Don&apos;t have an account? </span>
            <button
              type="button"
              className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-300"
              onClick={() => setToRegister(true)}
            >
              Sign up here
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
