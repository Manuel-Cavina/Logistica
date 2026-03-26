import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "ghost";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-[0_16px_34px_rgba(27,67,50,0.18)] hover:bg-[#143428] hover:shadow-[0_20px_40px_rgba(27,67,50,0.2)] focus-visible:ring-primary/20",
  ghost:
    "bg-primary/5 text-foreground hover:bg-primary/8 focus-visible:ring-primary/10",
};

export function Button({
  children,
  className,
  disabled,
  isLoading = false,
  loadingText = "Procesando",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-14 w-full items-center justify-center gap-2 rounded-[1.4rem] px-5 text-[15px] font-semibold tracking-[0.01em] transition duration-200 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className,
      )}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? (
        <>
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
