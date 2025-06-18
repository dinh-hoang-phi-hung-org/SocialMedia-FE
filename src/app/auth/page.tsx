"use client";

import { LoginForm } from "@/app/auth/_components/form/LoginForm";
import { useState } from "react";
import { RegisterForm } from "@/app/auth/_components/form/RegisterForm";
import UnAuthLayout from "@/shared/components/MainLayout/UnAuthLayout";
import Overlay from "@/shared/components/BaseLayouts/Overlay/Overlay";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState<boolean>(false);

  return (
    <UnAuthLayout>
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-50">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: "url('/assets/images/background.webp')",
            backgroundSize: "600px 600px",
            backgroundRepeat: "repeat",
            backgroundPosition: "0 0",
          }}
        ></div>

        <Overlay />

        <div className="relative z-10 w-full max-w-md mx-auto p-6">
          <div className="relative bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex relative">
              <div className="flex w-full bg-white/70 backdrop-blur-sm rounded-t-3xl border-b border-white/40">
                <button
                  onClick={() => setIsRegister(false)}
                  className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 border-b-2 ${
                    !isRegister
                      ? "text-gray-800 bg-white/70 shadow-sm border-blue-500"
                      : "text-gray-600 hover:text-gray-800 hover:bg-white/50 border-transparent"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setIsRegister(true)}
                  className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 border-b-2 ${
                    isRegister
                      ? "text-gray-800 bg-white/70 shadow-sm border-purple-500"
                      : "text-gray-600 hover:text-gray-800 hover:bg-white/50 border-transparent"
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            <div className="relative min-h-[500px] bg-white/50 backdrop-blur-sm shadow-2xl">
              <div
                className={`absolute inset-0 ${
                  !isRegister ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full"
                }`}
              >
                <LoginForm setToRegister={setIsRegister} />
              </div>

              <div
                className={`absolute inset-0 ${
                  isRegister ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
                }`}
              >
                <RegisterForm />
              </div>
            </div>
          </div>

          <div className="text-center mt-8 text-gray-800 drop-shadow-sm mx-24 shadow-2xl bg-primary-purple/50 backdrop-blur-sm rounded-full">
            <p className="text-sm font-medium drop-shadow-sm py-2 text-white">Welcome to our platform</p>
          </div>
        </div>
      </div>
    </UnAuthLayout>
  );
}
