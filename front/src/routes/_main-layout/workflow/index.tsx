import { createFileRoute } from '@tanstack/react-router'
import { WorkflowPage } from "@/features/workflow/pages/workflow-page.tsx";

export const Route = createFileRoute('/_main-layout/workflow/')({
  component: WorkflowPage,
})