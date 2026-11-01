import { useLocation } from "@tanstack/react-router"

import Navbar from "@/components/Navbar"
import { ToastViewport } from "@/components/ui/toast"

export default function NavbarLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const hideNavbar = location.pathname.match(/^\/(projects\/create|settings)(\/.*)?$/) !== null

  return <div>
    <div className={hideNavbar ? "pb-4" : "pb-20"}>
      {children}
    </div>
    <ToastViewport navbarVisible={!hideNavbar} />
    {!hideNavbar && <Navbar />}
  </div>
}