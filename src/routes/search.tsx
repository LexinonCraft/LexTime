import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/search')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/search"! <Link to="/activities/$activityId" params={{ activityId: "activity-326a9482-c5a6-48fa-8398-fcb3bd6e2269" }}>Go to activity</Link></div>
}
