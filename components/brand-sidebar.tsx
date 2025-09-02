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
          <span className="text-xl font-bold text-sidebar-foreground">Influensure</span>
        </div>
      </div>

      {/* User Info */}
      {loading ? (
        <div className="px-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-end mb-1">
                    <div className="h-5 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      ) : user ? (
        <div className="px-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12 ring-2 ring-primary/20 flex-shrink-0">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                    {profile?.username ? profile.username.charAt(1).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-end mb-1">
                    <Badge variant="default" className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 border-blue-200">
                      Brand
                    </Badge>
                  </div>
                  
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-900 break-words">
                  {profile?.username || 'User'}
                </p>
                <p className="text-xs text-gray-600 break-all leading-relaxed">
                  {userData?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

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

        <div className="mt-8 pt-4 border-t border-sidebar-border space-y-1">
          <Button
            variant={pathname === "/dashboard/brand/profile" ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              pathname === "/dashboard/brand/profile" && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
            asChild
          >
            <Link href="/dashboard/brand/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
          
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
