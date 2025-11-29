import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from "@/features/dashboard/dashboard-page.tsx";

export const Route = createFileRoute('/_main-layout/dashboard/')({
  component: DashboardPage,
})
