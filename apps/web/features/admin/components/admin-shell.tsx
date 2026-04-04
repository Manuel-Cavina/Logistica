import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AdminShellProps = {
  children: React.ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
};

export function AdminShell({
  children,
  description,
  eyebrow = "Area admin",
  title,
}: AdminShellProps) {
  return (
    <main className="min-h-screen bg-canvas px-6 py-12">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <Card className="p-8">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted">
                  {eyebrow}
                </p>
                <CardTitle>{title}</CardTitle>
                <CardDescription className="max-w-3xl text-base leading-7">
                  {description}
                </CardDescription>
              </div>

              <Link
                className="inline-flex items-center rounded-full border border-border/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary/5"
                href="/dashboard"
              >
                Volver al dashboard
              </Link>
            </div>
          </CardHeader>
        </Card>

        {children}
      </div>
    </main>
  );
}
