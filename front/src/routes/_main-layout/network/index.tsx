import { createFileRoute } from '@tanstack/react-router'
import { NetworkPage } from "@/features/network/page/network-page.tsx";

export const Route = createFileRoute('/_main-layout/network/')({
  component: NetworkPage,
})