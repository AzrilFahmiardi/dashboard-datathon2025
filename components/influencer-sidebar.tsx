"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  User,
  Target,
  BarChart3,
  Settings,
  Search,
  Calendar,
  DollarSign,
  MessageSquare,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard/influencer",
    icon: LayoutDashboard,
  },
  {
    title: "My Profile",
    href: "/dashboard/influencer/profile",
    icon: User,
  },
  {
    title: "Campaign Opportunities",
    href: "/dashboard/influencer/opportunities",
    icon: Search,
  },
  {
    title: "My Campaigns",
    href: "/dashboard/influencer/campaigns",
    icon: Target,
  },
  {
    title: "Analytics",
    href: "/dashboard/influencer/analytics",
    icon: BarChart3,
  },
  {
    title: "Earnings",
    href: "/dashboard/influencer/earnings",
    icon: DollarSign,
  },
  {
    title: "Messages",
    href: "/dashboard/influencer/messages",
    icon: MessageSquare,
  },
  {
    title: "Content Calendar",
    href: "/dashboard/influencer/calendar",
    icon: Calendar,
  },
  {
    title: "Settings",
    href: "/dashboard/influencer/settings",
    icon: Settings,
  },
]

export function InfluencerSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">I</span>
          </div>
          <span className="text-xl font-bold text-sidebar-foreground">InfluenceHub</span>
        </div>
      </div>

      <nav className="px-4 pb-4">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start", isActive && "bg-sidebar-accent text-sidebar-accent-foreground")}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            )
          })}
        </div>

        <div className="mt-8 pt-4 border-t border-sidebar-border">
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </nav>
    </div>
  )
}
