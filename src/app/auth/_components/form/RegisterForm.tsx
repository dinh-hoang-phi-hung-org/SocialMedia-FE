"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Eye, EyeOff, Loader2, Mail, User, Lock, ArrowRight } from "lucide-react";
import { RegisterFormValues } from "@/shared/types/common-type/auth-type";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";
import { ValidatorResult } from "@/shared/types/common-type/shared-types";
import authValidators from "../../_utils/auth-validator";
import commonValidators from "@/shared/utils/validation/common-validator";
import { toast } from "@/shared/components/ui/toast";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { useRouter } from "next/navigation";
import GoogleLoginButton from "@/shared/components/ui/ButtonGoogle";

export function RegisterForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const form = useForm<RegisterFormValues>({
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
    },
  });

  const validateField = (name: string, value: string): ValidatorResult => {
    switch (name) {
      case "username":
        return authValidators.username({ value, isUpdate: false });
      case "email":
        return commonValidators.email({ value, isUpdate: false });
      case "password":
        return authValidators.password({ value, isUpdate: false });
      case "confirmPassword":
        return authValidators.confirmPassword(form.getValues("password"), value);
      default:
        return { resultType: "success", errorMessage: null };
    }
  };

  const onSubmit = async (values: RegisterFormValues) => {
    const fieldsToValidate = [
      { field: "username", value: values.username.trim() },
      { field: "email", value: values.email.trim() },
      { field: "password", value: values.password },
      { field: "confirmPassword", value: values.confirmPassword },
    ];

    const validationErrors = fieldsToValidate
      .map(({ field, value }) => ({
        field,
        error: validateField(field, value),
      }))
      .filter(({ error }) => error.resultType !== "success");

    if (validationErrors.length > 0) {
      setError({
        username: false,
        email: false,
        password: false,
        confirmPassword: false,
      });

      // Set error state for fields with validation errors
      const newErrorState = { ...error };
      validationErrors.forEach(({ field }) => {
        newErrorState[field as keyof typeof newErrorState] = true;
      });
      setError(newErrorState);

      const errorMessages = validationErrors.map(({ error }, index) => (
        <LabelShadcn
          key={index}
          translate
          text={error.errorMessage || "common:auth.validation-error"}
          className="text-white"
        />
      ));

      toast.error({
        title: "common:auth.validation-error",
        description: errorMessages,
      });
      return;
    }

    setError({
      username: false,
      email: false,
      password: false,
      confirmPassword: false,
    });

    setLoading(true);
    try {
      const response = await TypeTransfer["Auth"].otherAPIs?.register(values);
      if (response?.payload) {
        toast.success({
          title: "common:notification.success",
          description: response.payload.message,
        });
        router.push("/");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error({
        title: "common:notification.error",
        description: error.message || "An error occurred during registration",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-8 py-4 bg-transparent">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
        <p className="text-gray-600">Join us today and start your journey</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      type="text"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (error.email) {
                          setError((prev) => ({ ...prev, email: false }));
                        }
                      }}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Username Field */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <FormControl>
                    <Input
                      className={`
                        pl-12 pr-4 py-3 h-12 
                        bg-white/60 backdrop-blur-sm 
                        border border-gray-300/60 
                        rounded-xl
                        text-gray-800 placeholder:text-gray-500
                        focus:bg-white/80 focus:border-purple-400
                        transition-all duration-300
                        ${error.username ? "border-red-400 bg-red-50/60" : ""}
                      `}
                      placeholder={t("common:auth.enter-your-username")}
                      {...field}
                      autoComplete="new-user"
                      onChange={(e) => {
                        field.onChange(e);
                        if (error.username) {
                          setError((prev) => ({ ...prev, username: false }));
                        }
                      }}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          focus:bg-white/80 focus:border-purple-400
                          transition-all duration-300
                          ${error.password ? "border-red-400 bg-red-50/60" : ""}
                        `}
                        placeholder={t("common:auth.enter-your-password")}
                        {...field}
                        autoComplete="new-password"
                        onChange={(e) => {
                          field.onChange(e);
                          if (error.password) {
                            setError((prev) => ({ ...prev, password: false }));
                          }
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`
                          pl-12 pr-12 py-3 h-12 
                          bg-white/60 backdrop-blur-sm 
                          border border-gray-300/60 
                          rounded-xl
                          text-gray-800 placeholder:text-gray-500
                          focus:bg-white/80 focus:border-purple-400
                          transition-all duration-300
                          ${error.confirmPassword ? "border-red-400 bg-red-50/60" : ""}
                        `}
                        placeholder={t("common:auth.confirm-password")}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (error.confirmPassword) {
                            setError((prev) => ({ ...prev, confirmPassword: false }));
                          }
                        }}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute inset-y-0 right-0 top-1/2 -translate-y-1/2 hover:bg-gray-100/60 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-start space-x-3 text-sm">
            <input
              type="checkbox"
              id="terms"
              className="mt-1 rounded border-gray-300 bg-white text-blue-500 focus:ring-2 focus:ring-blue-500"
              required
            />
            <label htmlFor="terms" className="text-gray-600 leading-relaxed">
              I agree to the{" "}
              <button type="button" className="text-blue-600 underline hover:text-blue-700">
                Terms of Service
              </button>{" "}
              and{" "}
              <button type="button" className="text-blue-600 underline hover:text-blue-700">
                Privacy Policy
              </button>
            </label>
          </div>

          {/* Register Button */}
          <Button
            variant="default"
            type="submit"
            disabled={loading}
            className="
              w-full h-12 
              bg-gradient-to-r from-purple-500 to-pink-600 
              hover:from-purple-600 hover:to-pink-700
              border-0 rounded-xl 
              font-semibold text-white
              transition-all duration-300 
              transform hover:scale-[1.02] active:scale-[0.98]
              disabled:opacity-70 disabled:cursor-not-allowed
              shadow-lg hover:shadow-xl
              group
            "
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating account...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            )}
          </Button>
        </form>
      </Form>

      <GoogleLoginButton className="my-4 " />
    </div>
  );
}
