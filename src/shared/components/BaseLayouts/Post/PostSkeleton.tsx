import { Skeleton } from "@/shared/components/ui/skeleton";

export function PostSkeleton() {
  return (
    <div className="flex">
      <div className="flex flex-col items-center mr-3">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />

        <Skeleton className="w-0.5 h-full mt-2" />
      </div>

      <div className="flex-1 min-w-0">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" /> {/* Username */}
            <Skeleton className="h-3 w-16" /> {/* Timestamp */}
          </div>
          <Skeleton className="h-5 w-5 rounded-full" /> {/* More button */}
        </div>

        {/* Content Skeleton */}
        <div className="mt-1 mb-3 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[60%]" />
        </div>

        {/* Media Skeleton */}
        <div className="flex gap-2">
          <Skeleton className="w-full h-[280px] rounded-xl mb-3" />
          <Skeleton className="w-full h-[280px] rounded-xl mb-3" />
          <Skeleton className="w-full h-[280px] rounded-xl mb-3" />
          <Skeleton className="w-full h-[280px] rounded-xl mb-3" />
        </div>

        {/* Actions Skeleton */}
        <div className="flex items-center gap-4 mt-2">
          <Skeleton className="h-5 w-5" /> {/* Like */}
          <Skeleton className="h-5 w-5" /> {/* Comment */}
          <Skeleton className="h-5 w-5" /> {/* Bookmark */}
        </div>

        {/* Post Stats Skeleton */}
        <div className="mt-2 flex items-center gap-2">
          <Skeleton className="h-3 w-16" /> {/* Likes count */}
          <Skeleton className="h-3 w-3 rounded-full" /> {/* Dot */}
          <Skeleton className="h-3 w-16" /> {/* Comments count */}
        </div>
      </div>
    </div>
  );
}
