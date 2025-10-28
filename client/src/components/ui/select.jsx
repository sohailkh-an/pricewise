import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const Select = React.forwardRef(
  (
    {
      className,
      children,
      value,
      onValueChange,
      placeholder = "Select option...",
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    const selectedOption = React.useMemo(() => {
      if (!children || !Array.isArray(children)) return null;
      return children.find((child) => child?.props?.value === value);
    }, [children, value]);

    return (
      <DropdownMenu open={open} onOpenChange={setOpen} className="w-full">
        <DropdownMenuTrigger asChild>
          <button
            ref={ref}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            disabled={disabled}
            {...props}
          >
            <span className="truncate">
              {selectedOption ? selectedOption.props.children : placeholder}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>
        </DropdownMenuTrigger>
        {/* <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]"> */}
        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
          {React.Children.map(children, (child) =>
            React.cloneElement(child, {
              onSelect: (value) => {
                onValueChange?.(value);
                setOpen(false);
              },
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);
Select.displayName = "Select";

const SelectItem = React.forwardRef(
  ({ className, children, value, onSelect, ...props }, ref) => {
    return (
      <DropdownMenuItem
        ref={ref}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          className
        )}
        onSelect={(e) => {
          e.preventDefault();
          onSelect?.(value);
        }}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-4 w-4 opacity-0" />
        </span>
        {children}
      </DropdownMenuItem>
    );
  }
);
SelectItem.displayName = "SelectItem";

export { Select, SelectItem };
