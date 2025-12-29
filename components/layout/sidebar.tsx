"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  User,
  FolderTree,
  BookOpen,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  Award,
  GraduationCap,
} from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: User, label: "My Profile", href: "/admin/profile" },
  { icon: FolderTree, label: "Categories", href: "/admin/categories" },
  { icon: BookOpen, label: "Courses", href: "/admin/courses" },
  { icon: Users, label: "Employees", href: "/admin/employees" },
  { icon: ClipboardList, label: "Quiz Management", href: "/admin/quizzes" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
]

const employeeMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/employee/dashboard" },
  { icon: User, label: "My Profile", href: "/employee/profile" },
  { icon: GraduationCap, label: "Enrolled Courses", href: "/employee/courses" },
  { icon: Award, label: "My Certificates", href: "/employee/certificates" },
  { icon: Settings, label: "Settings", href: "/employee/settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const menuItems = user?.role === "admin" ? adminMenuItems : employeeMenuItems

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <h1 className="text-xl font-bold">LMS Portal</h1>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      <div className="border-t border-sidebar-border p-3">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )
}
