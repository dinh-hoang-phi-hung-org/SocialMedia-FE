"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { LoginFormType, RegisterFormValues } from "@/shared/types/common-type/auth-type";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";
import { Card } from "@/shared/components/ui/card";
import { ValidatorResult } from "@/shared/types/common-type/shared-types";
import authValidators from "../../_utils/auth-validator";
import commonValidators from "@/shared/utils/validation/common-validator";
import { toast } from "@/shared/components/ui/toast";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { useRouter } from "next/navigation";

export function RegisterForm({ setToRegister }: Readonly<LoginFormType>) {
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
    <Card className="h-full bg-white p-8 rounded-2xl shadow-lg">
      <LabelShadcn className="text-center text-inherit text-2xl font-bold" text="common:button.register" translate />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4 mb-4 mt-4">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <LabelShadcn className="text-inherit" text="common:auth.email" inheritedClass translate />
                  <FormControl>
                    <Input
                      className={`rounded-lg ${error.email ? "border-red-500" : ""} text-sm`}
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Username Field */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <LabelShadcn className="text-inherit" text="common:auth.username" inheritedClass translate />
                  <FormControl>
                    <Input
                      className={`rounded-lg ${error.username ? "border-red-500" : ""} text-sm`}
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
                  <FormMessage />
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
                      className="absolute inset-y-0 right-0 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
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
                  <LabelShadcn className="text-inherit" text="common:auth.confirm-password" inheritedClass translate />
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`rounded-lg pr-10 ${error.confirmPassword ? "border-red-500" : ""} text-sm`}
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
                      className="absolute inset-y-0 right-0 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Register Button */}
          <Button
            variant="default"
            type="submit"
            className={`w-full transition-all duration-300 ${loading ? "opacity-80" : ""} mt-4`}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <LabelShadcn
                  className="text-inherit cursor-pointer"
                  text="common:button.registering"
                  inheritedClass
                  translate
                />
              </>
            ) : (
              <LabelShadcn
                className="text-inherit cursor-pointer"
                text="common:button.register"
                inheritedClass
                translate
              />
            )}
          </Button>

          {/* Login Link */}
          <div className="text-center flex items-center justify-center gap-2 mt-4">
            <LabelShadcn className="text-inherit" text="common:button.back-to-login" inheritedClass translate />{" "}
            <Button
              type="button"
              className="cursor-pointer bg-transparent hover:opacity-70 p-0"
              onClick={() => setToRegister(false)}
              variant="ghost"
              disabled={loading}
            >
              <LabelShadcn
                className="text-primary cursor-pointer font-semibold"
                text="common:button.login"
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
