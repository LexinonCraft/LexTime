import { createFileRoute } from '@tanstack/react-router'
import TestCard from '../components/TestCard'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    {[...Array(30)].map(() => <TestCard />)}
  </div>
}
