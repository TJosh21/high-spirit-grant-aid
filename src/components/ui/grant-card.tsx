import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Building2 } from "lucide-react";
import { format, isPast, differenceInDays } from "date-fns";

export interface GrantCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  funder: string;
  amountMin?: number | null;
  amountMax?: number | null;
  deadline?: string | null;
  status?: "open" | "coming_soon" | "closed";
  tags?: string[];
  location?: string | null;
  category?: string | null;
  matchScore?: number;
  onClick?: () => void;
}

const getDeadlineStatus = (deadline: string | null | undefined) => {
  if (!deadline) return { label: "No deadline", variant: "neutral" as const };
  
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const daysUntil = differenceInDays(deadlineDate, today);
  
  if (isPast(deadlineDate)) {
    return { label: "Expired", variant: "expired" as const };
  }
  if (daysUntil <= 7) {
    return { label: `${daysUntil} days left`, variant: "closingSoon" as const };
  }
  if (daysUntil <= 30) {
    return { label: `${daysUntil} days left`, variant: "closingSoon" as const };
  }
  return { label: format(deadlineDate, "MMM d, yyyy"), variant: "open" as const };
};

const formatAmount = (min?: number | null, max?: number | null) => {
  if (!min && !max) return "Amount varies";
  if (min && max) {
    if (min >= 1000 && max >= 1000) {
      return `$${(min / 1000).toFixed(0)}k – $${(max / 1000).toFixed(0)}k`;
    }
    return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
  }
  if (max) return `Up to $${max >= 1000 ? (max / 1000).toFixed(0) + 'k' : max.toLocaleString()}`;
  if (min) return `From $${min >= 1000 ? (min / 1000).toFixed(0) + 'k' : min.toLocaleString()}`;
  return "Amount varies";
};

const GrantCard = React.forwardRef<HTMLDivElement, GrantCardProps>(
  ({ 
    className, 
    title, 
    funder, 
    amountMin, 
    amountMax, 
    deadline, 
    status = "open",
    tags = [], 
    location, 
    category,
    matchScore,
    onClick,
    ...props 
  }, ref) => {
    const deadlineStatus = getDeadlineStatus(deadline);
    
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          "rounded-2xl bg-card p-5 md:p-6 transition-all duration-300 cursor-pointer",
          "shadow-card hover:shadow-premium hover:-translate-y-1",
          "border border-border/30 hover:border-border/50",
          "group relative overflow-hidden",
          className
        )}
        {...props}
      >
        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-secondary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative">
          {/* Top row: Match score + Category */}
          <div className="flex items-center justify-between mb-3">
            {matchScore ? (
              <Badge variant="accent" className="text-xs font-semibold">
                {matchScore}% Match
              </Badge>
            ) : category ? (
              <Badge variant="category" className="text-xs">
                {category}
              </Badge>
            ) : (
              <div />
            )}
            
            {/* Status badge */}
            <Badge 
              variant={
                deadlineStatus.variant === "expired" ? "statusExpired" :
                deadlineStatus.variant === "closingSoon" ? "statusClosingSoon" :
                "statusOpen"
              }
              className="text-xs"
            >
              {deadlineStatus.label}
            </Badge>
          </div>
          
          {/* Title */}
          <h3 className="font-bold text-primary text-base md:text-lg mb-1.5 line-clamp-2 group-hover:text-primary/90 transition-colors">
            {title}
          </h3>
          
          {/* Funder row */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{funder}</span>
          </div>
          
          {/* Amount + Location row */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-accent text-sm md:text-base">
              {formatAmount(amountMin, amountMax)}
            </span>
            
            {location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[100px]">{location}</span>
              </div>
            )}
          </div>
          
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="pillNeutral" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="pillNeutral" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

GrantCard.displayName = "GrantCard";

export { GrantCard };
