import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: "sm" | "md" | "lg";
  onClear?: () => void;
  showClear?: boolean;
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, size = "md", onClear, showClear = true, value, ...props }, ref) => {
    const hasValue = value && String(value).length > 0;
    
    return (
      <div className={cn("relative w-full", className)}>
        {/* Search icon */}
        <div 
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground",
            size === "sm" && "left-3",
            size === "lg" && "left-5"
          )}
        >
          <Search 
            className={cn(
              "h-4 w-4",
              size === "lg" && "h-5 w-5"
            )} 
          />
        </div>
        
        {/* Input */}
        <input
          ref={ref}
          type="text"
          value={value}
          className={cn(
            "w-full bg-card border border-border/50 rounded-full",
            "text-foreground placeholder:text-muted-foreground",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50",
            "shadow-soft hover:shadow-card",
            // Size variants
            size === "sm" && "h-10 pl-9 pr-9 text-sm",
            size === "md" && "h-12 pl-11 pr-11 text-base",
            size === "lg" && "h-14 pl-13 pr-13 text-lg"
          )}
          {...props}
        />
        
        {/* Clear button */}
        {showClear && hasValue && (
          <button
            type="button"
            onClick={onClear}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2",
              "text-muted-foreground hover:text-foreground",
              "transition-colors duration-200",
              "p-1 rounded-full hover:bg-muted/50",
              size === "sm" && "right-3",
              size === "lg" && "right-5"
            )}
          >
            <X 
              className={cn(
                "h-4 w-4",
                size === "lg" && "h-5 w-5"
              )} 
            />
          </button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";

export { SearchBar };
