import * as React from "react"

interface TabsProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const Tabs = ({ children, ...props }: TabsProps) => {
  return <div {...props}>{children}</div>;
};

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          inline-flex h-10 items-center justify-center rounded-md 
          bg-muted p-1 text-muted-foreground
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className = "", children, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={`
          inline-flex items-center justify-center whitespace-nowrap 
          rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background 
          transition-all focus-visible:outline-none focus-visible:ring-2 
          focus-visible:ring-ring focus-visible:ring-offset-2 
          disabled:pointer-events-none disabled:opacity-50 
          data-[state=active]:bg-background data-[state=active]:text-foreground 
          data-[state=active]:shadow-sm
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          mt-2 ring-offset-background focus-visible:outline-none 
          focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsList.displayName = "TabsList";
TabsTrigger.displayName = "TabsTrigger";
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent }; 