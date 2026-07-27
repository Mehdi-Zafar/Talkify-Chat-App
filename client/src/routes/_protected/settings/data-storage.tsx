import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/settings/data-storage')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/settings/data-storage"!</div>
}
