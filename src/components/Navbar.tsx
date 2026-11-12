import { Link, useMatchRoute } from "@tanstack/react-router"
import { ChartArea, ClipboardList, House, type LucideIcon, Search } from "lucide-react"

type Entry = {
    icon: LucideIcon,
    name: string,
    route: "/" | "/worktree" | "/statistics" | "/settings" | "/lists" | "/search"
}

const entries: Entry[] = [
  {
    icon: House,
    name: "Home",
    route: "/"
  },
  {
    icon: ClipboardList,
    name: "Lists",
    route: "/lists"
  },
  {
    icon: Search,
    name: "Search",
    route: "/search"
  },
  {
    icon: ChartArea,
    name: "Statistics",
    route: "/statistics"
  }
]

function NavbarItem({ entry: { icon: Icon, name, route }, selected }: { entry: Entry, selected: boolean }) {
  return <Link to={route} className="flex-1 flex p-1 select-none">
    <div className={`flex-1 flex flex-col justify-center place-items-center rounded-[13em] ${selected && "text-primary bg-[rgba(100,100,100,0.1)]"}`}>
      <Icon />
    </div>
  </Link>
}

export default function Navbar() {
  const matchRoute = useMatchRoute()

  return <div className="fixed bottom-5 left-5 right-5 h-15 rounded-[15em] flex flex-row justify-stretch bg-[rgba(230,230,230,0.5)] border backdrop-blur-xl browser:hidden">
    {entries.map((entry, i) => <NavbarItem key={i} entry={entry} selected={matchRoute({ to: entry.route }) !== false} />)}
  </div>
}