import { createFileRoute } from "@tanstack/react-router";
import CohortsPage from "@/features/cohorts/pages/cohorts-page.tsx";

export const Route = createFileRoute("/_main-layout/cohorts/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CohortsPage />;
}
