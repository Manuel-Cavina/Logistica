import { VehicleEditPage } from '@/features/vehicle/pages/vehicle-edit-page';

type VehicleEditRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VehicleEditRoute({
  params,
}: VehicleEditRouteProps) {
  const { id } = await params;

  return <VehicleEditPage vehicleId={id} />;
}
