import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/settings/help')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/settings/help"!</div>
}
