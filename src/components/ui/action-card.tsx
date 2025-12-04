import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface ActionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  onClick?: () => void;
  href?: string;
}

const ActionCard = React.forwardRef<HTMLDivElement, ActionCardProps>(
  ({ 
    className, 
    title, 
    description, 
    icon: Icon, 
    iconColor = "text-primary",
    iconBgColor = "bg-primary/10",
    onClick,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          "h-full shadow-card hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300",
          "rounded-2xl group cursor-pointer border-0 overflow-hidden bg-card",
          className
        )}
        {...props}
      >
        <div className="p-5 md:p-6 relative h-full">
          {/* Hover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative">
            {/* Icon container */}
            <div 
              className={cn(
                "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-4",
                "group-hover:scale-110 transition-transform duration-300",
                iconBgColor
              )}
            >
              <Icon className={cn("h-7 w-7 md:h-8 md:w-8", iconColor)} />
            </div>
            
            {/* Title */}
            <h3 className="font-bold text-primary text-base md:text-lg mb-1.5">
              {title}
            </h3>
            
            {/* Description */}
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ActionCard.displayName = "ActionCard";

export { ActionCard };
