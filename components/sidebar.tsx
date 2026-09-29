"use client"

import { useRouter, usePathname } from "next/navigation"
import { Home, Dumbbell, TrendingUp, Apple, Target, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Workouts", href: "/workouts", icon: Dumbbell },
  { name: "Nutrition", href: "/nutrition", icon: Apple },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Progress", href: "/progress", icon: TrendingUp },
]

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem("fitnessUser")
    router.push("/login")
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-cyan-500/20 flex flex-col shadow-2xl shadow-cyan-500/10">
      <div className="p-6 border-b border-cyan-500/20 bg-gradient-to-r from-green-500/10 to-cyan-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 via-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/50 animate-pulse">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-xl bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
              WellNes Pro
            </h2>
            <p className="text-xs text-cyan-300/80 font-medium">Transform. Track. Thrive.</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 transition-all duration-300 text-slate-300 hover:text-white",
                "hover:bg-gradient-to-r hover:from-green-500/20 hover:to-cyan-500/20 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/20",
                "border border-transparent hover:scale-105",
                isActive &&
                  "bg-gradient-to-r from-green-500 to-cyan-500 text-white border-cyan-400/50 shadow-lg shadow-cyan-500/50 scale-105",
              )}
              onClick={() => router.push(item.href)}
            >
              <Icon className={cn("w-5 h-5", isActive && "animate-pulse")} />
              <span className="font-medium">{item.name}</span>
            </Button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-cyan-500/20 space-y-2 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 transition-all duration-300 text-slate-300 hover:text-white",
            "hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20",
            "border border-transparent hover:scale-105",
            pathname === "/profile" &&
              "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400/50 shadow-lg shadow-purple-500/50 scale-105",
          )}
          onClick={() => router.push("/profile")}
        >
          <User className={cn("w-5 h-5", pathname === "/profile" && "animate-pulse")} />
          <span className="font-medium">Profile</span>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 border border-transparent hover:scale-105 hover:shadow-lg hover:shadow-red-500/20"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </aside>
  )
}
