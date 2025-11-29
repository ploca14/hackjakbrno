import { createFileRoute } from '@tanstack/react-router'
import { AnalyticsPage } from '@/features/analytics/pages/analytics-page'

export const Route = createFileRoute('/_main-layout/analytics/')({
  component: AnalyticsPage,
})