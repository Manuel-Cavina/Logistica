import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AdminStatePanelProps = {
  actionLabel?: string;
  description: string;
  onAction?: () => void;
  title: string;
};

export function AdminStatePanel({
  actionLabel,
  description,
  onAction,
  title,
}: AdminStatePanelProps) {
  return (
    <Card className="p-8">
      <CardHeader>
        <CardTitle className="text-[1.8rem]">{title}</CardTitle>
        <CardDescription className="max-w-2xl text-base leading-7">
          {description}
        </CardDescription>
      </CardHeader>

      {actionLabel && onAction ? (
        <CardContent>
          <Button className="max-w-[14rem]" onClick={onAction} type="button">
            {actionLabel}
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
