import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main-layout/patients/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_main-layout/patients/"!</div>
}
