import { createFileRoute } from '@tanstack/react-router'
import { SimulationPage } from "@/features/simulation/pages/simulation-page.tsx";

export const Route = createFileRoute('/_main-layout/simulate/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SimulationPage/>
}
