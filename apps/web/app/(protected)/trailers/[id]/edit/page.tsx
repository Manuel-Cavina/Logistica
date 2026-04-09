import { TrailerEditPage } from '@/features/vehicle/pages/trailer-edit-page';

type TrailerEditRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TrailerEditRoute({
  params,
}: TrailerEditRouteProps) {
  const { id } = await params;

  return <TrailerEditPage trailerId={id} />;
}
