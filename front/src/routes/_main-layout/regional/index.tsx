import { createFileRoute } from '@tanstack/react-router'
import { RegionalPage } from "@/features/regional/pages/regional-page.tsx";

export const Route = createFileRoute('/_main-layout/regional/')({
  component: RegionalPage,
})