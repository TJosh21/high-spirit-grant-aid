import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface SegmentedTabsProps {
  tabs: {
    value: string;
    label: string;
    count?: number;
  }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SegmentedTabs = React.forwardRef<HTMLDivElement, SegmentedTabsProps>(
  ({ tabs, value, onChange, className, size = "md" }, ref) => {
    const activeIndex = tabs.findIndex((tab) => tab.value === value);
    
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex bg-muted/50 rounded-xl p-1 gap-1",
          "border border-border/30",
          className
        )}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.value === value;
          
          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className={cn(
                "relative rounded-lg font-medium transition-colors duration-200",
                "flex items-center justify-center gap-1.5",
                // Size variants
                size === "sm" && "px-3 py-1.5 text-xs",
                size === "md" && "px-4 py-2 text-sm",
                size === "lg" && "px-5 py-2.5 text-base",
                // Color states
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active background */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border/50"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              
              {/* Tab content */}
              <span className="relative z-10">{tab.label}</span>
              
              {/* Count badge */}
              {typeof tab.count === "number" && (
                <span 
                  className={cn(
                    "relative z-10 px-1.5 py-0.5 rounded-full text-xs font-medium",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }
);

SegmentedTabs.displayName = "SegmentedTabs";

export { SegmentedTabs };
