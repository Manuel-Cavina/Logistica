import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
};

export function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      aria-invalid={error ? "true" : "false"}
      className={cn(
        "flex min-h-[120px] w-full rounded-[1.2rem] border bg-input px-4 py-3.5 text-[15px] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.32)] outline-none transition placeholder:text-muted/80 focus-visible:ring-4 resize-none",
        error
          ? "border-destructive/45 bg-[rgba(255,245,242,0.9)] focus-visible:border-destructive focus-visible:ring-destructive/12"
          : "border-border/80 focus-visible:border-tertiary focus-visible:ring-primary/12",
        className,
      )}
      {...props}
    />
  );
}
