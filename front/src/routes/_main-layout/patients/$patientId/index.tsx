import { createFileRoute } from "@tanstack/react-router";
import PatientDetailPage from "../../../../features/patient-detail/pages/patient-detail-page";

export const Route = createFileRoute("/_main-layout/patients/$patientId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { patientId } = Route.useParams()
  return <PatientDetailPage patientId={patientId}/>;
}
