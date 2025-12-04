import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/70",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-2xl border-0 bg-card p-6 shadow-card", className)} {...props}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-3/4 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

function SkeletonStat({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-2xl border-0 bg-card p-5 shadow-card", className)} {...props}>
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
      <Skeleton className="h-10 w-16 mb-2" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

function SkeletonHero({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn("rounded-3xl p-8 md:p-12", className)} 
      style={{ background: 'linear-gradient(135deg, hsl(220 90% 15%) 0%, hsl(220 85% 22%) 100%)' }}
      {...props}
    >
      <Skeleton className="h-6 w-48 rounded-full mb-5 bg-white/10" />
      <Skeleton className="h-10 w-80 mb-4 bg-white/10" />
      <Skeleton className="h-6 w-96 bg-white/10" />
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonStat, SkeletonHero };
