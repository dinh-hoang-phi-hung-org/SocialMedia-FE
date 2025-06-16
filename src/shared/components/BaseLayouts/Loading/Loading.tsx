import { Card } from "@/shared/components/ui/card";
import { LucideLoader2, LucideMessageCircle, LucideHeart, LucideThumbsUp } from "lucide-react";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Card className="max-w-md w-full p-8 shadow-xl border-t-4 border-t-primary-purple rounded-xl overflow-hidden relative">
        <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-blue-500/10 blur-xl"></div>
        <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-purple-500/10 blur-xl"></div>

        <div className="flex flex-col items-center justify-center space-y-8 relative z-10">
          <div className="relative">
            <LucideLoader2 className="h-16 w-16 text-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-4 bg-background rounded-full"></div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              <LabelShadcn text="Loading..." translate={false} className="text-[1.2rem] font-semibold" />
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              <LabelShadcn text="Please wait while we fetch your content" translate={false} className="" />
            </p>
          </div>

          <div className="w-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between w-full max-w-xs text-muted-foreground/70">
            <div className="flex flex-col items-center gap-1">
              <div className="">
                <LucideMessageCircle className="h-8 w-8 text-blue-500 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="">
                <LucideHeart className="h-8 w-8 text-red-500 animate-bounce" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="">
                <LucideThumbsUp className="h-8 w-8 text-blue-500 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-primary to-purple-500 rounded-full animate-loading-progress"></div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 shadow-sm animate-pulse">
              #Loading
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 shadow-sm animate-pulse delay-75">
              #AlmostReady
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-pink-100 text-pink-800 dark:bg-pink-900/60 dark:text-pink-200 shadow-sm animate-pulse delay-150">
              #JustAMoment
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
