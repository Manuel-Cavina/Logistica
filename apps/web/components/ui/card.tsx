import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type CardSectionProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ className, ...props }: CardSectionProps) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-border/70 bg-panel/95 text-panel-foreground shadow-soft backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardSectionProps) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export function CardTitle({ className, ...props }: CardSectionProps) {
  return (
    <div
      className={cn("font-heading text-[2rem] font-semibold leading-tight text-foreground", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: CardSectionProps) {
  return <p className={cn("text-sm leading-6 text-muted", className)} {...props} />;
}

export function CardContent({ className, ...props }: CardSectionProps) {
  return <div className={cn("space-y-6", className)} {...props} />;
}
