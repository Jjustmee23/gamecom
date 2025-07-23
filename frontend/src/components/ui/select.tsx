import * as React from "react"
import { ChevronDown } from "lucide-react"

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const Select = ({ children, ...props }: SelectProps) => {
  return <div {...props}>{children}</div>;
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className = "", children, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={`
          flex h-10 w-full items-center justify-between rounded-md 
          border border-input bg-background px-3 py-2 text-sm 
          ring-offset-background placeholder:text-muted-foreground 
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 
          disabled:cursor-not-allowed disabled:opacity-50
          ${className}
        `}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md 
          border bg-popover text-popover-foreground shadow-md
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className = "", children, onClick, ...props }, ref) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`
          relative flex w-full cursor-default select-none items-center 
          rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none 
          focus:bg-accent focus:text-accent-foreground 
          data-[disabled]:pointer-events-none data-[disabled]:opacity-50
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const SelectValue = ({ children }: { children: React.ReactNode }) => {
  return <span>{children}</span>;
};

SelectTrigger.displayName = "SelectTrigger";
SelectContent.displayName = "SelectContent";
SelectItem.displayName = "SelectItem";

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
}; 