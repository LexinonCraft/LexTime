import { Link, useLocation } from "@tanstack/react-router"
import { BriefcaseBusiness, ChartArea, House, Settings, type LucideIcon } from "lucide-react"

type Entry = {
    icon: LucideIcon,
    name: string,
    route: "/" | "/projects" | "/statistics" | "/settings"
}

const entries: Entry[] = [
    {
        icon: House,
        name: "Home",
        route: "/"
    },
    {
        icon: BriefcaseBusiness,
        name: "Projects",
        route: "/projects"
    },
    {
        icon: ChartArea,
        name: "Statistics",
        route: "/statistics"
    },
    {
        icon: Settings,
        name: "Settings",
        route: "/settings"
    }
]

function NavbarItem({ entry: { icon: Icon, name, route }, selected }: { entry: Entry, selected: boolean }) {
    return <Link to={route} className="flex-1 flex p-1 select-none">
        <div className={`flex-1 flex flex-col justify-center place-items-center rounded-md ${selected && "text-primary bg-[rgba(100,100,100,0.1)]"}`}>
            <Icon />
            <div>
                <span>{name}</span>
            </div>
        </div>
    </Link>
}

export default function Navbar() {
    const location = useLocation()
    const matchIndex = entries.findIndex((entry, i) => i !== 0 && location.pathname.startsWith(entry.route))
    const selected = matchIndex < 0 ? 0 : matchIndex

    return <div className="fixed bottom-0 left-0 right-0 pb-5 h-20 flex flex-row justify-stretch bg-[rgba(230,230,230,0.5)] backdrop-blur-xl browser:hidden">
        {entries.map((entry, i) => <NavbarItem key={i} entry={entry} selected={i == selected} />)}
    </div>
}