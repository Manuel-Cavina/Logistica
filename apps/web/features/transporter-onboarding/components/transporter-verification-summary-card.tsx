import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/src/lib/utils";
import {
  getTransporterVerificationStatusConfig,
  getTransporterVerificationToneStyles,
} from "../config/transporter-verification-status.config";
import { TransporterVerificationBadge } from "./transporter-verification-badge";
import type { TransporterVerificationStatus } from "../types/transporter-profile.types";

type TransporterVerificationSummaryCardProps = {
  ctaHref?: string;
  className?: string;
  description?: string;
  showCta?: boolean;
  status: TransporterVerificationStatus;
  title?: string;
};

export function TransporterVerificationSummaryCard({
  ctaHref,
  className,
  description,
  showCta = true,
  status,
  title,
}: TransporterVerificationSummaryCardProps) {
  const statusConfig = getTransporterVerificationStatusConfig(status);
  const toneStyles = getTransporterVerificationToneStyles(statusConfig.tone);
  const resolvedDescription = description ?? statusConfig.description;
  const resolvedTitle = title ?? statusConfig.title;
  const resolvedCtaHref = ctaHref ?? statusConfig.cta?.href;

  return (
    <Card
      className={cn(
        "border-white/70 bg-white/85 p-6 shadow-[0_16px_40px_rgba(21,40,33,0.08)] sm:p-8",
        toneStyles.card,
        className,
      )}
    >
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
            Verificacion
          </p>
          <TransporterVerificationBadge status={status} />
        </div>

        <div className="space-y-2">
          <CardTitle className={toneStyles.cardAccent}>{resolvedTitle}</CardTitle>
          <CardDescription className="max-w-2xl">{resolvedDescription}</CardDescription>
        </div>
      </CardHeader>

      {showCta && statusConfig.cta && resolvedCtaHref ? (
        <CardContent>
          <a
            className="inline-flex h-14 items-center justify-center rounded-[1.4rem] bg-primary px-5 text-[15px] font-semibold text-primary-foreground shadow-[0_16px_34px_rgba(27,67,50,0.18)] transition hover:bg-[#143428] hover:shadow-[0_20px_40px_rgba(27,67,50,0.2)]"
            href={resolvedCtaHref}
          >
            {statusConfig.cta.label}
          </a>
        </CardContent>
      ) : null}
    </Card>
  );
}
