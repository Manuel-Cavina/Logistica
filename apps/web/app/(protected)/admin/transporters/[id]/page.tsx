import { AdminTransporterDetailPage } from "@/features/admin/pages/admin-transporter-detail-page";

type AdminTransporterDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminTransporterDetailRoute({
  params,
}: AdminTransporterDetailRouteProps) {
  const { id } = await params;

  return <AdminTransporterDetailPage transporterId={id} />;
}
