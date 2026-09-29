"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Activity, Flame, Clock, TrendingUp } from "lucide-react"

interface WorkoutStats {
  totalWorkouts: number
  totalCalories: number
  averageDuration: number
  totalSets: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>("")
  const [stats, setStats] = useState<WorkoutStats>({
    totalWorkouts: 0,
    totalCalories: 0,
    averageDuration: 0,
    totalSets: 0,
  })

  useEffect(() => {
    // Simple client-side protection: redirect to login if no access token
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/login')
        return
      }
    } catch (e) {
      // if localStorage isn't available just continue
    }

    const workoutsData = localStorage.getItem("workouts")
    if (workoutsData) {
      const workouts = JSON.parse(workoutsData)
      const totalWorkouts = workouts.length
      let totalCalories = 0
      let totalDuration = 0
      let totalSets = 0

      workouts.forEach((workout: any) => {
        if (workout.calories) totalCalories += Number.parseInt(workout.calories)
        if (workout.duration) totalDuration += Number.parseInt(workout.duration)
        if (workout.sets) totalSets += Number.parseInt(workout.sets)
      })

      const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0

      setStats({
        totalWorkouts,
        totalCalories,
        averageDuration,
        totalSets,
      })
    }

    const userData = localStorage.getItem("fitnessUser")
    if (userData) {
      const user = JSON.parse(userData)
      setUserName(user.name || "User")
    }
  }, [])

  const handleLogout = async () => {
    try {
      const API = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:4000'
      // best-effort notify server to clear refresh cookie
      await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' })
    } catch (e) {
      // ignore network errors here
    }
    try { localStorage.removeItem('accessToken') } catch (e) {}
    router.push('/login')
  }

  const statCards = [
    {
      title: "Total Workouts",
      value: stats.totalWorkouts,
      icon: Activity,
      color: "bg-gradient-to-br from-green-400 to-green-600",
    },
    {
      title: "Calories Burned",
      value: stats.totalCalories,
      icon: Flame,
      color: "bg-gradient-to-br from-orange-400 to-orange-600",
    },
    {
      title: "Avg Duration",
      value: `${stats.averageDuration} min`,
      icon: Clock,
      color: "bg-gradient-to-br from-cyan-400 to-cyan-600",
    },
    {
      title: "Total Sets",
      value: stats.totalSets,
      icon: TrendingUp,
      color: "bg-gradient-to-br from-pink-400 to-pink-600",
    },
  ]

  return (
    <div className="flex min-h-screen bg-green-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="relative h-[280px] rounded-3xl overflow-hidden shadow-2xl hover-3d bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500">
            <div className="absolute inset-0 flex items-center">
              <div className="px-12 space-y-4 w-full">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <Activity className="w-11 h-11 text-white" />
                  </div>
                  <div>
                    <h1 className="text-6xl font-bold text-white tracking-tight animate-fade-in drop-shadow-lg">
                      WellNes Pro
                    </h1>
                    <p className="text-2xl text-white/95 italic animate-fade-in animation-delay-200 drop-shadow-md">
                      Transform Your Life, One Day at a Time
                    </p>
                  </div>
                </div>
                <p className="text-white/90 text-lg max-w-2xl animate-fade-in animation-delay-400 drop-shadow-md">
                  Your complete wellness companion for tracking workouts, nutrition, and achieving your fitness goals
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: Hero Image */}
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl hover-3d">
              <img
                src="/wellness-fitness-hero-runner.jpg"
                alt="Wellness and fitness inspiration"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <div className="text-white">
                  <h2 className="text-3xl font-bold mb-2">Your Wellness Journey</h2>
                  <p className="text-lg opacity-90">Track progress, achieve goals, transform your life</p>
                </div>
              </div>
            </div>

            {/* Right: Welcome + Stats */}
            <div className="space-y-6">
              <div>
                    <div className="flex items-center justify-between">
                      <h1 className="text-4xl font-bold text-foreground mb-2">Welcome Back, {userName}!</h1>
                      {/* Logout is available in the left sidebar — avoid duplicate controls in the header */}
                      <div />
                    </div>
                <p className="text-lg text-muted-foreground">Here's your fitness progress at a glance</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {statCards.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <Card
                      key={index}
                      className="p-6 hover-3d cursor-pointer border-none shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${
                          stat.color.includes("green")
                            ? "oklch(0.7 0.18 145), oklch(0.55 0.18 145)"
                            : stat.color.includes("orange")
                              ? "oklch(0.75 0.2 35), oklch(0.65 0.2 35)"
                              : stat.color.includes("cyan")
                                ? "oklch(0.75 0.15 190), oklch(0.6 0.22 190)"
                                : "oklch(0.75 0.18 330), oklch(0.65 0.18 330)"
                        })`,
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white/90 text-sm font-medium mb-2">{stat.title}</p>
                          <p className="text-3xl font-bold text-white">{stat.value}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Motivational Section */}
          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-1">Keep Going Strong!</h3>
                <p className="text-muted-foreground">
                  Consistency is key. Log your workouts regularly to track your amazing progress.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
