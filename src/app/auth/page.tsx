"use client";

import { LoginForm } from "@/app/auth/_components/form/LoginForm";
import { useState } from "react";
import { RegisterForm } from "@/app/auth/_components/form/RegisterForm";
import UnAuthLayout from "@/shared/components/MainLayout/UnAuthLayout";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState<boolean | null>(null);

  return (
    <UnAuthLayout>
      <div className="w-full h-full flex self-center justify-center items-center z-0 relative">
        <div
          className={`absolute overflow-hidden rounded-2xl ${isRegister == true ? "move-left-to-hide" : isRegister == false ? "move-right-to-show" : "default-above-position"}`}
        >
          <LoginForm setToRegister={setIsRegister} />
        </div>
        <div
          className={`absolute bg-secondary-bc overflow-hidden rounded-2xl ${isRegister == true ? "move-right-to-show" : isRegister == false ? "move-left-to-hide" : "default-below-position"}`}
        >
          <RegisterForm setToRegister={setIsRegister} />
        </div>
      </div>
    </UnAuthLayout>
  );
}
