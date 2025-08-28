"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, Users, Target, BarChart3, Settings, Search, Calendar, FileText, LogOut, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { logoutUser } from "@/lib/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard/brand",
    icon: LayoutDashboard,
  },
  {
    title: "Influencer List",
    href: "/dashboard/brand/influencers",
    icon: Users,
  },
  {
    title: "My Campaigns",
    href: "/dashboard/brand/campaigns",
    icon: Target,
  },
]

export function BrandSidebar() {
  const pathname = usePathname()
  const { user, userData, profile, loading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logoutUser()
      toast.success('Berhasil logout')
      router.push('/login/brand')
    } catch (error) {
      toast.error('Gagal logout')
    }
  }

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">I</span>
          </div>
          <span className="text-xl font-bold text-sidebar-foreground">InfluenceHub</span>
        </div>
      </div>

      {/* User Info */}
      {user && !loading && (
        <div className="px-4 mb-4">
          <div className="bg-sidebar-accent rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {profile?.username ? profile.username.charAt(1).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
                  {profile?.username || 'User'}
                </p>
                <div className="flex items-center space-x-1">
                  <Badge variant="secondary" className="text-xs">
                    Brand
                  </Badge>
                </div>
                <p className="text-xs text-sidebar-accent-foreground/70 truncate">
                  {userData?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="px-4 pb-4 flex-1">
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
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </nav>
    </div>
  )
}
