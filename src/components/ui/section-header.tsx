import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  size?: "sm" | "md" | "lg";
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, description, action, size = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-start md:items-center justify-between gap-4",
          size === "sm" && "mb-3",
          size === "md" && "mb-4 md:mb-5",
          size === "lg" && "mb-6 md:mb-8",
          className
        )}
        {...props}
      >
        <div className="flex-1 min-w-0">
          <h2 
            className={cn(
              "font-bold text-primary font-display",
              size === "sm" && "text-base md:text-lg",
              size === "md" && "text-lg md:text-xl",
              size === "lg" && "text-xl md:text-2xl"
            )}
          >
            {title}
          </h2>
          {description && (
            <p 
              className={cn(
                "text-muted-foreground mt-0.5",
                size === "sm" && "text-xs",
                size === "md" && "text-sm",
                size === "lg" && "text-base"
              )}
            >
              {description}
            </p>
          )}
        </div>
        
        {action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={action.onClick}
            className="gap-1 text-primary shrink-0"
          >
            {action.label}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
);

SectionHeader.displayName = "SectionHeader";

export { SectionHeader };
