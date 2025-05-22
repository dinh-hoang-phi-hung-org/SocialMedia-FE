"use client";

import { LoginForm } from "@/app/auth/_components/form/LoginForm";
import { useState } from "react";
import { RegisterForm } from "@/app/auth/_components/form/RegisterForm";
import UnAuthLayout from "@/shared/components/MainLayout/UnAuthLayout";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState<boolean | null>(null);

  return (
    <UnAuthLayout>
      <div className="w-full flex flex-col items-center justify-center py-8">
        {/* Auth card container with decorative elements */}
        <div className="relative w-full max-w-md mx-auto">
          {/* Decorative elements with motion */}
          <motion.div
            className="absolute -top-10 -left-10 w-20 h-20 rounded-full bg-primary/10 z-0 auth-decorative-circle"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="absolute -bottom-8 -right-8 w-16 h-16 rounded-full bg-secondary-bc/20 z-0 auth-decorative-circle"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />

          {/* Card container with shadow effect */}
          <motion.div
            className="relative w-full h-[500px] rounded-2xl bg-white/5 backdrop-blur-sm overflow-hidden z-10 auth-card-container"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Animated forms */}
            <div className="w-full h-full flex self-center justify-center items-center z-0 relative">
              <div
                className={`absolute overflow-hidden rounded-2xl auth-form-container ${isRegister == true ? "move-left-to-hide" : isRegister == false ? "move-right-to-show" : "default-above-position"}`}
              >
                <LoginForm setToRegister={setIsRegister} />
              </div>
              <div
                className={`absolute bg-secondary-bc overflow-hidden rounded-2xl auth-form-container ${isRegister == true ? "move-right-to-show" : isRegister == false ? "move-left-to-hide" : "default-below-position"}`}
              >
                <RegisterForm setToRegister={setIsRegister} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Welcome message with motion */}
        <motion.div
          className="mt-8 text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-800">Welcome to MultilanguageWeb</h2>
          <p className="text-gray-600 mt-2">Sign in to access your account or create a new one</p>
        </motion.div>
      </div>
    </UnAuthLayout>
  );
}
