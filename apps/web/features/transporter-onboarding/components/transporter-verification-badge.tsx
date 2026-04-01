import { cn } from "@/src/lib/utils";
import {
  getTransporterVerificationStatusConfig,
  getTransporterVerificationToneStyles,
} from "../config/transporter-verification-status.config";
import type { TransporterVerificationStatus } from "../types/transporter-profile.types";

type TransporterVerificationBadgeProps = {
  className?: string;
  status: TransporterVerificationStatus;
};

export function TransporterVerificationBadge({
  className,
  status,
}: TransporterVerificationBadgeProps) {
  const statusConfig = getTransporterVerificationStatusConfig(status);
  const toneStyles = getTransporterVerificationToneStyles(statusConfig.tone);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold",
        toneStyles.badge,
        className,
      )}
    >
      {statusConfig.label}
    </span>
  );
}
