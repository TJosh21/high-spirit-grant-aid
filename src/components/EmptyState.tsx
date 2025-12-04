import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  actionHref 
}: EmptyStateProps) => {
  return (
    <Card variant="elevated" className="rounded-3xl border-0">
      <CardContent className="py-16 md:py-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mx-auto mb-8 relative"
        >
          {/* Decorative rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-muted-foreground/10 animate-[spin_20s_linear_infinite]" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border border-dashed border-muted-foreground/5 animate-[spin_30s_linear_infinite_reverse]" />
          </div>
          
          {/* Icon container */}
          <div className="relative h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center shadow-lg">
            <div className="absolute inset-2 rounded-full bg-card shadow-inner" />
            <Icon className="relative h-10 w-10 text-muted-foreground/60" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h3 className="mb-3 text-xl md:text-2xl font-bold text-primary font-display">
            {title}
          </h3>
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            {description}
          </p>
        </motion.div>

        {actionLabel && (onAction || actionHref) && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Button 
              variant="gold"
              size="lg" 
              onClick={onAction}
              className="gap-2 rounded-full px-8"
            >
              {actionLabel}
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
