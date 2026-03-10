import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import I18nextProvider from "@/shared/utils/functions/multilingual/i18nProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { LanguageProvider } from "@/shared/hooks/useLanguage";
import "./globals.css";
import { Toaster } from "@/shared/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Social Media H",
  description: "Social Media H",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/assets/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/assets/images/android-chrome-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
          <I18nextProvider>
            <LanguageProvider>{children}</LanguageProvider>
            <Toaster />
          </I18nextProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
