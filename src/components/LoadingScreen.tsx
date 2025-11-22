import { Skeleton } from '@/components/ui/skeleton';

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Hero Skeleton */}
      <div className="bg-muted py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-96 mb-4" />
          <Skeleton className="h-6 w-[500px]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* Stats Cards Skeleton */}
        <div className="mb-10 grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border bg-card p-6">
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-10 w-20 mb-2" />
              <Skeleton className="h-1 w-full" />
            </div>
          ))}
        </div>

        {/* Section Title Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Cards Skeleton */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border bg-card p-6">
              <div className="mb-4 flex items-start justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
