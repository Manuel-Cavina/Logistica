"use client";

import { BriefcaseBusiness, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RegisterRole } from "@/features/auth/types/auth.types";

type RoleSelectorProps = {
  disabled?: boolean;
  onChange: (role: RegisterRole) => void;
  value: RegisterRole;
};

const roleOptions: Array<{
  icon: typeof BriefcaseBusiness;
  label: string;
  value: RegisterRole;
}> = [
  {
    value: "CLIENT",
    label: "Cliente",
    icon: BriefcaseBusiness,
  },
  {
    value: "TRANSPORTER",
    label: "Transportista",
    icon: Truck,
  },
];

export function RoleSelector({ disabled = false, onChange, value }: RoleSelectorProps) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-xs font-semibold text-foreground/92">
        Perfil de cuenta
      </legend>

      <div className="grid gap-2 sm:grid-cols-2">
        {roleOptions.map((option) => {
          const isSelected = option.value === value;
          const Icon = option.icon;

          return (
            <label
              key={option.value}
              className={cn(
                "flex h-11 cursor-pointer items-center justify-center rounded-[1rem] border px-3 py-1 text-center transition duration-200",
                isSelected
                  ? "border-tertiary bg-primary/6 shadow-[0_14px_32px_rgba(27,67,50,0.1)]"
                  : "border-border/80 bg-input/80 hover:border-tertiary/45 hover:bg-primary/4",
                disabled && "cursor-not-allowed opacity-70",
              )}
            >
              <input
                checked={isSelected}
                className="sr-only"
                disabled={disabled}
                name="role"
                onChange={() => onChange(option.value)}
                type="radio"
                value={option.value}
              />

              <span className="flex items-center justify- ">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-7 items-center justify-left rounded-[0.72rem]  transition",
                    isSelected
                      ? "border-tertiary/35 bg-tertiary/12 text-tertiary"
                      : "border-border/80 bg-panel text-secondary",
                  )}
                >
                  <Icon className="size-[0.82rem]" strokeWidth={1.8} />
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {option.label}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
