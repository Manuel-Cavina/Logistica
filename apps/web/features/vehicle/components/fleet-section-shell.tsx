'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function LoadingStateCard({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="animate-pulse space-y-4 rounded-[1.6rem] border border-dashed border-border/70 bg-panel/45 p-5">
      <div className="space-y-2">
        <div className="h-5 w-44 rounded-full bg-primary/8" />
        <div className="h-4 w-80 max-w-full rounded-full bg-primary/5" />
      </div>
      <div className="space-y-3">
        <div className="h-14 rounded-[1.2rem] bg-black/4" />
        <div className="h-14 rounded-[1.2rem] bg-black/4" />
      </div>
      <p className="text-sm leading-6 text-muted">
        {title}. {description}
      </p>
    </div>
  );
}

export function EmptyStateCard({
  actionHref,
  actionLabel,
  description,
  title,
}: {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  title: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-border/70 bg-panel/55 p-5">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          className="mt-4 inline-flex min-h-12 items-center justify-center rounded-[1.25rem] bg-primary/5 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-primary/8"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function ErrorStateCard({
  description,
  onRetry,
  title,
}: {
  description: string;
  onRetry: () => void;
  title: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-destructive/20 bg-[rgba(177,88,63,0.06)] p-5">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      <Button
        className="mt-4 max-w-[12rem]"
        onClick={onRetry}
        type="button"
        variant="ghost"
      >
        Reintentar
      </Button>
    </div>
  );
}

export function FleetSectionShell({
  children,
  description,
  eyebrow,
  title,
}: {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <Card className="overflow-hidden border-white/75 bg-white/86 shadow-[0_18px_40px_rgba(21,40,33,0.08)] backdrop-blur">
      <CardHeader className="space-y-3 px-7 pt-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
          {eyebrow}
        </p>
        <CardTitle className="text-[2rem]">{title}</CardTitle>
        <CardDescription className="text-base leading-7">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-7 pb-7">{children}</CardContent>
    </Card>
  );
}
