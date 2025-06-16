import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { LucideHome, LucideRefreshCw, LucideWifi, LucideWifiOff } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center to-muted/30">
      <Card className="max-w-xl w-full p-8 shadow-xl border-t-4 border-t-primary-purple rounded-xl overflow-hidden relative">
        <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-blue-500/10 blur-xl"></div>
        <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-purple-500/10 blur-xl"></div>

        <div className="flex flex-col items-center justify-center space-y-8 relative z-10">
          {/* Social Media Icon and 404 */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="text-9xl font-extrabold bg-gradient-to-r from-blue-500 via-primary-purple to-pink-500 bg-clip-text text-transparent animate-pulse-slow">
                404
              </div>
            </div>
          </div>

          {/* Error Messages */}
          <div className="space-y-3 text-center">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              <LabelShadcn text="common:text.page-not-found" translate className="text-[1.2rem] font-semibold" />
            </h2>
            <p className="text-muted-foreground text-lg">
              <LabelShadcn text="common:text.page-not-exist" translate className="" />
            </p>
          </div>

          {/* Social Media Themed Graphics */}
          <div className="flex items-center justify-center gap-6 text-muted-foreground">
            <div className="flex flex-col items-center gap-1">
              <div className="relative">
                <LucideWifiOff className="h-8 w-8 text-red-500 absolute opacity-70" />
                <LucideWifi className="h-8 w-8 text-muted-foreground animate-ping absolute opacity-30" />
                <div className="h-8 w-8"></div>
              </div>
              <span className="text-xs mt-2">Connection Lost</span>
            </div>
            <div className="flex flex-col items-center gap-1 animate-pulse-slow">
              <LucideRefreshCw className="h-8 w-8 animate-spin-slow text-blue-500" />
              <span className="text-xs mt-2">Refresh</span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 rounded-full shadow-md shadow-blue-500/20"
            asChild
          >
            <Link href="/" className="flex items-center justify-center gap-2">
              <LucideHome className="h-5 w-5" />
              <LabelShadcn text="common:text.go-to-home" translate className="text-white font-semibold" />
            </Link>
          </Button>

          {/* Social Media Style Tags */}
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 shadow-sm">
              #PostNotFound
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 shadow-sm">
              #SocialMedia
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-pink-100 text-pink-800 dark:bg-pink-900/60 dark:text-pink-200 shadow-sm">
              #Error404
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200 shadow-sm">
              #TryAgainLater
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
