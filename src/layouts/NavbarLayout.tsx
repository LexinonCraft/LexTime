import Navbar from "@/components/Navbar"
import { useOnline } from "@/hooks/useOnline"

export default function NavbarLayout({ children }: { children: React.ReactNode }) {
    const online = useOnline()

    return <div className="pb-15">
        {!online && (
            <div className="sticky top-0 z-10 bg-amber-100 px-3 py-2 text-center text-sm text-amber-900 ring-1 ring-amber-300">
                You are offline. Changes are saved locally.
            </div>
        )}
        <div className="">
            {children}
        </div>
        <Navbar />
    </div>
}