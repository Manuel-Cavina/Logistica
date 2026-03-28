import type { InputHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      aria-invalid={error ? "true" : "false"}
      className={cn(
        "flex h-14 w-full rounded-[1.2rem] border bg-input px-4 text-[15px] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.32)] outline-none transition placeholder:text-muted/80 focus-visible:ring-4",
        error
          ? "border-destructive/45 bg-[rgba(255,245,242,0.9)] focus-visible:border-destructive focus-visible:ring-destructive/12"
          : "border-border/80 focus-visible:border-tertiary focus-visible:ring-primary/12",
        className,
      )}
      {...props}
    />
  );
}
