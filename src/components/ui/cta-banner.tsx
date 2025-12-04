import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

export interface CTABannerProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  buttonLabel: string;
  buttonIcon?: LucideIcon;
  onAction?: () => void;
  variant?: "accent" | "primary";
}

const CTABanner = React.forwardRef<HTMLDivElement, CTABannerProps>(
  ({ 
    className, 
    title, 
    description, 
    buttonLabel, 
    buttonIcon: ButtonIcon,
    onAction, 
    variant = "accent",
    ...props 
  }, ref) => {
    const gradientStyles = {
      accent: "linear-gradient(135deg, hsl(43 90% 58%) 0%, hsl(43 95% 65%) 50%, hsl(43 90% 60%) 100%)",
      primary: "linear-gradient(135deg, hsl(220 90% 15%) 0%, hsl(220 85% 22%) 100%)",
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden border-0 shadow-premium rounded-3xl",
          className
        )}
        {...props}
      >
        <div 
          className="p-8 md:p-10 lg:p-12 text-center relative"
          style={{ background: gradientStyles[variant] }}
        >
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-primary/5 blur-xl" />
          </div>
          
          <div className="relative">
            <h3 
              className={cn(
                "text-xl md:text-2xl font-bold mb-3 font-display",
                variant === "accent" ? "text-primary" : "text-white"
              )}
            >
              {title}
            </h3>
            
            {description && (
              <p 
                className={cn(
                  "text-base md:text-lg mb-6 max-w-md mx-auto",
                  variant === "accent" ? "text-primary/75" : "text-white/75"
                )}
              >
                {description}
              </p>
            )}
            
            <Button 
              onClick={onAction}
              size="lg"
              className={cn(
                "gap-2 rounded-full px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300",
                variant === "accent" 
                  ? "bg-primary text-white hover:bg-primary-hover" 
                  : "bg-accent text-primary hover:bg-accent-hover"
              )}
            >
              {ButtonIcon && <ButtonIcon className="h-5 w-5" />}
              {buttonLabel}
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

CTABanner.displayName = "CTABanner";

export { CTABanner };
