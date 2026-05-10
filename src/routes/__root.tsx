import { createRootRoute, Outlet } from "@tanstack/react-router"
import NavbarLayout from "../layouts/NavbarLayout"

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
    return <NavbarLayout>
        <Outlet />
    </NavbarLayout>
}