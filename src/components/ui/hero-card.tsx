import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export interface HeroCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  subtitle?: string;
  badge?: string;
  children?: React.ReactNode;
  variant?: "primary" | "accent" | "gradient";
}

const HeroCard = React.forwardRef<HTMLDivElement, HeroCardProps>(
  ({ className, title, subtitle, badge, children, variant = "primary", ...props }, ref) => {
    const gradientStyles = {
      primary: "linear-gradient(135deg, hsl(220 90% 15%) 0%, hsl(220 85% 20%) 50%, hsl(220 75% 28%) 100%)",
      accent: "linear-gradient(135deg, hsl(43 90% 58%) 0%, hsl(43 95% 65%) 50%, hsl(43 90% 60%) 100%)",
      gradient: "linear-gradient(135deg, hsl(220 90% 15%) 0%, hsl(220 85% 25%) 100%)",
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden shadow-premium border-0 rounded-3xl",
          className
        )}
        {...props}
      >
        <div 
          className="relative p-6 md:p-10 lg:p-12"
          style={{ background: gradientStyles[variant] }}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-accent/10 blur-2xl" />
            <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-accent/5 blur-xl" />
          </div>
          
          <div className="relative z-10">
            {/* Badge */}
            {badge && (
              <Badge 
                className={cn(
                  "mb-5 px-4 py-2 rounded-full text-xs font-semibold tracking-wide backdrop-blur-sm",
                  variant === "accent" 
                    ? "bg-primary/15 text-primary border-primary/20" 
                    : "bg-white/15 text-white border-white/20"
                )}
              >
                <Sparkles className="h-3.5 w-3.5 mr-2" />
                {badge}
              </Badge>
            )}
            
            {/* Title */}
            <h1 
              className={cn(
                "text-2xl md:text-4xl lg:text-5xl font-bold mb-4 font-display leading-tight",
                variant === "accent" ? "text-primary" : "text-white"
              )}
            >
              {title}
            </h1>
            
            {/* Subtitle */}
            {subtitle && (
              <p 
                className={cn(
                  "text-base md:text-lg lg:text-xl max-w-2xl leading-relaxed",
                  variant === "accent" ? "text-primary/75" : "text-white/75"
                )}
              >
                {subtitle}
              </p>
            )}
            
            {/* Additional content */}
            {children}
          </div>
        </div>
      </div>
    );
  }
);

HeroCard.displayName = "HeroCard";

export { HeroCard };
