import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border text-sm font-semibold no-underline outline-none select-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-canvas",
        outline: "border-line bg-surface text-secondary",
        secondary: "border-line bg-surface-raised text-foreground",
        ghost: "border-transparent bg-transparent text-secondary",
        link:
          "h-auto border-transparent bg-transparent p-0 text-primary underline decoration-line-strong underline-offset-4",
      },
      size: {
        sm: "min-h-9 px-3 py-2 text-xs",
        default: "min-h-11 px-4 py-2.5",
        lg: "min-h-12 px-5 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button };
