import { createFileRoute } from '@tanstack/react-router'
import TestCard from '../components/TestCard'
import Activity from '@/components/Activity'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="p-3">
    <h1 className="text-3xl font-bold mb-5">Welcome, lexinon!</h1>
    <h2 className="text-2xl font-bold my-3">Active activities</h2>
    <Activity />
    <h2 className="text-2xl font-bold my-3">Recommended activities</h2>
    <Activity />
    <Activity />
    <Activity />
  </div>
}
