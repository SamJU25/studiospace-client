import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/12 text-primary border border-primary/20",
        secondary: "bg-secondary text-secondary-foreground border border-border",
        success:
          "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25",
        warning:
          "bg-amber-500/12 text-amber-700 dark:text-amber-300 border border-amber-500/25",
        destructive:
          "bg-red-500/12 text-red-700 dark:text-red-300 border border-red-500/25",
        info: "bg-sky-500/12 text-sky-700 dark:text-sky-300 border border-sky-500/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
