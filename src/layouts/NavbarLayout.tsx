import Navbar from "@/components/Navbar"

export default function NavbarLayout({ children }: { children: React.ReactNode }) {
    return <div className="pb-15">
        <div className="">
            {children}
        </div>
        <Navbar />
    </div>
}