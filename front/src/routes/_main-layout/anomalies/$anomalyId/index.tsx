import { createFileRoute } from "@tanstack/react-router";
import AnomalyPage from "@/features/anomaly/pages/anomaly-page.tsx";

export const Route = createFileRoute("/_main-layout/anomalies/$anomalyId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { anomalyId } = Route.useParams()
  return <AnomalyPage anomalyId={anomalyId}/>;
}
