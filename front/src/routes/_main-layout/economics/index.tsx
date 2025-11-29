import { createFileRoute } from "@tanstack/react-router";
import { EconomicsPage } from "@/features/economics/pages/economics-page.tsx";

export const Route = createFileRoute("/_main-layout/economics/")({
  component: EconomicsPage,
});
