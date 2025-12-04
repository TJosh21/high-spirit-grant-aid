import { Skeleton, SkeletonCard, SkeletonStat, SkeletonHero } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="px-4 md:px-6 lg:px-8 py-6 md:py-10 max-w-5xl mx-auto space-y-6 md:space-y-8">
        {/* Hero Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <SkeletonHero />
        </motion.div>

        {/* Stats Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-3 gap-3 md:gap-5"
        >
          {[1, 2, 3].map((i) => (
            <SkeletonStat key={i} />
          ))}
        </motion.div>

        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-2"
        >
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </motion.div>

        {/* Quick Actions Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="grid grid-cols-2 gap-3 md:gap-5"
        >
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border-0 bg-card p-5 shadow-card">
              <Skeleton className="h-14 w-14 rounded-2xl mb-4" />
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </motion.div>

        {/* Cards Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="space-y-4"
        >
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export const GrantsListLoading = () => {
  return (
    <div className="space-y-4 md:space-y-5">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
        >
          <SkeletonCard />
        </motion.div>
      ))}
    </div>
  );
};

export const GrantDetailLoading = () => {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 md:py-10 max-w-4xl mx-auto space-y-5 md:space-y-6">
      {/* Back button */}
      <Skeleton className="h-8 w-32" />

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl bg-card shadow-premium p-0 overflow-hidden"
      >
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-6 md:p-10">
            <Skeleton className="h-6 w-32 rounded-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="md:w-80 p-6 md:p-10 bg-muted/30 border-t md:border-t-0 md:border-l border-border/20">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-40 mb-6" />
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-8 w-28 rounded-full mb-6" />
            <Skeleton className="h-4 w-12 mb-2" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </motion.div>

      {/* Content Cards */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          className="rounded-2xl bg-card shadow-card p-6"
        >
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </motion.div>
      ))}
    </div>
  );
};
