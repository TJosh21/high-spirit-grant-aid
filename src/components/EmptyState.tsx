import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
    <Card className="shadow-card">
      <CardContent className="py-16 text-center">
        <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center animate-float-up">
          <Icon className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-foreground font-display">{title}</h3>
        <p className="text-base text-muted-foreground mb-6 max-w-md mx-auto">
          {description}
        </p>
        {actionLabel && (onAction || actionHref) && (
          <Button 
            size="lg" 
            onClick={onAction}
            className="gap-2"
          >
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
