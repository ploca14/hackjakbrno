import { createFileRoute } from "@tanstack/react-router";
import SearchPage from "@/features/search/pages/search-page.tsx";

export const Route = createFileRoute("/_main-layout/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SearchPage />;
}
