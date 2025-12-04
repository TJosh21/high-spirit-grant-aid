import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface GrantCardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const GrantCardSkeleton = React.forwardRef<HTMLDivElement, GrantCardSkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl bg-card p-5 md:p-6 shadow-card border border-border/30",
          className
        )}
        {...props}
      >
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        
        {/* Title */}
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mb-3" />
        
        {/* Funder */}
        <Skeleton className="h-4 w-40 mb-4" />
        
        {/* Amount + Location */}
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        
        {/* Tags */}
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
    );
  }
);

GrantCardSkeleton.displayName = "GrantCardSkeleton";

// Multiple skeletons for list loading
const GrantsListSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <GrantCardSkeleton 
          key={index} 
          className={cn(
            "animate-fade-in-up",
            `animation-delay-${(index % 5) * 100}`
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        />
      ))}
    </div>
  );
};

export { GrantCardSkeleton, GrantsListSkeleton };
