import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

const statCardVariants = cva(
  "rounded-2xl bg-card p-4 md:p-5 transition-all duration-300 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "shadow-card hover:shadow-card-hover border border-border/50",
        elevated: "shadow-card-hover hover:shadow-premium border-0",
        outline: "border-2 border-border bg-transparent hover:bg-card/50",
      },
      tone: {
        default: "",
        success: "hover:border-status-success/30",
        warning: "hover:border-accent/30",
        info: "hover:border-status-info/30",
        accent: "hover:border-accent/30",
      },
    },
    defaultVariants: {
      variant: "default",
      tone: "default",
    },
  }
);

const iconContainerVariants = cva(
  "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-sm",
  {
    variants: {
      tone: {
        default: "bg-primary",
        success: "bg-status-success",
        warning: "bg-accent",
        info: "bg-status-info",
        accent: "bg-accent",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  }
);

const valueVariants = cva(
  "text-2xl md:text-3xl lg:text-4xl font-bold font-display",
  {
    variants: {
      tone: {
        default: "text-primary",
        success: "text-status-success",
        warning: "text-accent",
        info: "text-status-info",
        accent: "text-accent",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  }
);

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, variant, tone, label, value, icon: Icon, trend, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(statCardVariants({ variant, tone }), className)}
        {...props}
      >
        {/* Hover background effect */}
        <div 
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            tone === "success" && "bg-status-success/5",
            tone === "warning" && "bg-accent/5",
            tone === "info" && "bg-status-info/5",
            tone === "accent" && "bg-accent/10",
            tone === "default" && "bg-primary/5"
          )} 
        />
        
        <div className="relative">
          {Icon && (
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(iconContainerVariants({ tone }))}>
                <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>
          )}
          
          <div className={cn(valueVariants({ tone }))}>
            {value}
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-muted-foreground font-medium">
              {label}
            </span>
            
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium flex items-center gap-1",
                  trend.direction === "up" && "text-status-success",
                  trend.direction === "down" && "text-destructive",
                  trend.direction === "neutral" && "text-muted-foreground"
                )}
              >
                {trend.direction === "up" && "↑"}
                {trend.direction === "down" && "↓"}
                {trend.value}%
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

StatCard.displayName = "StatCard";

export { StatCard, statCardVariants };
