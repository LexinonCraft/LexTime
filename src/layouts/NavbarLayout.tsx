import Navbar from "@/components/Navbar"
import { useOnline } from "@/hooks/useOnline"
import { useLocation } from "@tanstack/react-router"
import { ToastViewport } from "@/components/ui/toast"

export default function NavbarLayout({ children }: { children: React.ReactNode }) {
    const online = useOnline()
    const location = useLocation()
    const hideNavbar = location.pathname === "/projects/create"

    return <div className="">
        {!online && (
            <div className="sticky top-0 z-10 bg-amber-100 px-3 py-2 text-center text-sm text-amber-900 ring-1 ring-amber-300">
                You are offline. Changes are saved locally.
            </div>
        )}
        <div className={hideNavbar ? "pb-4" : "pb-20"}>
            {children}
        </div>
        <ToastViewport navbarVisible={!hideNavbar} />
        {!hideNavbar && <Navbar />}
    </div>
}