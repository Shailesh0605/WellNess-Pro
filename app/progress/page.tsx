"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { apiFetch } from "@/lib/auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Calendar, Clock, Flame, Activity, TrendingUp, Dumbbell, Heart, Sparkles } from "lucide-react"

interface Workout {
  id?: number
  category: string
  exercises: string[]
  duration: string
  calories?: string
  sets?: string
  reps?: string
  intensity: string
  timestamp: string
  notes?: string
}

interface WorkoutsByDate {
  date: string
  workouts: Workout[]
}

interface WorkoutsByCategory {
  cardio: Workout[]
  strength: Workout[]
  mindBody: Workout[]
}

export default function ProgressPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [groupedWorkouts, setGroupedWorkouts] = useState<WorkoutsByDate[]>([])

  useEffect(() => {
    loadWorkouts()
  }, [])

  const loadWorkouts = () => {
    // Try to load from backend first (requires auth). If that fails, fallback to localStorage for anonymous/demo users.
    ;(async () => {
      try {
        const res = await apiFetch('/progress')
        if (res.ok) {
          const logs = await res.json()
          // logs: [{ id, data, timestamp, ... }]
          const parsed = logs.map((l: any) => ({ id: l.id, ...(l.data || {}), timestamp: l.timestamp }))
          setWorkouts(parsed)
          setGroupedWorkouts(groupWorkoutsByDate(parsed))
          return
        }
      } catch (err) {
        // ignore and fallback
      }

      const workoutsData = localStorage.getItem("workouts")
      if (workoutsData) {
        const parsedWorkouts = JSON.parse(workoutsData)
        setWorkouts(parsedWorkouts.reverse())

        const grouped = groupWorkoutsByDate(parsedWorkouts)
        setGroupedWorkouts(grouped)
      }
    })()
  }

  const groupWorkoutsByDate = (workouts: Workout[]): WorkoutsByDate[] => {
    const groups: { [key: string]: Workout[] } = {}

    workouts.forEach((workout) => {
      const date = new Date(workout.timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(workout)
    })

    return Object.entries(groups)
      .map(([date, workouts]) => ({ date, workouts }))
      .reverse()
  }

  const groupWorkoutsByCategory = (workouts: Workout[]): WorkoutsByCategory => {
    return {
      cardio: workouts.filter((w) => w.category.toLowerCase() === "cardio"),
      strength: workouts.filter((w) => w.category.toLowerCase() === "strength"),
      mindBody: workouts.filter((w) => w.category.toLowerCase().includes("mind")),
    }
  }

  const deleteWorkout = (timestamp: string, category: string) => {
    // Try backend delete first if this workout has an id
    const workoutsData = localStorage.getItem("workouts")
    const allWorkouts = workoutsData ? JSON.parse(workoutsData) : []

    // Find by timestamp+category in localStorage copy
    const index = allWorkouts.findIndex((w: Workout) => w.timestamp === timestamp && w.category === category)
    const found = index !== -1 ? allWorkouts[index] : null

    ;(async () => {
      try {
        if (found && found.id) {
          const res = await apiFetch(`/progress/${found.id}`, { method: 'DELETE' })
          if (res.ok) {
            // remove locally if present
            if (index !== -1) {
              allWorkouts.splice(index, 1)
              localStorage.setItem("workouts", JSON.stringify(allWorkouts))
            }
            loadWorkouts()
            return
          }
        }
      } catch (err) {
        // ignore
      }

      // fallback: remove from localStorage
      if (index !== -1) {
        allWorkouts.splice(index, 1)
        localStorage.setItem("workouts", JSON.stringify(allWorkouts))
        loadWorkouts()
      }
    })()
  }

  const clearAllWorkouts = () => {
    if (confirm("Are you sure you want to delete all workout logs?")) {
      localStorage.setItem("workouts", JSON.stringify([]))
      setWorkouts([])
      setGroupedWorkouts([])
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const categoryConfig = {
    cardio: {
      title: "Cardio Workouts",
      icon: Heart,
      gradient: "from-red-500 to-orange-500",
      bgGradient: "from-red-50 to-orange-50",
      textColor: "text-red-700",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    strength: {
      title: "Strength Training",
      icon: Dumbbell,
      gradient: "from-blue-500 to-purple-500",
      bgGradient: "from-blue-50 to-purple-50",
      textColor: "text-blue-700",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    mindBody: {
      title: "Mind & Body",
      icon: Sparkles,
      gradient: "from-green-500 to-teal-500",
      bgGradient: "from-green-50 to-teal-50",
      textColor: "text-green-700",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
  }

  return (
    <div className="flex min-h-screen bg-green-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Your Progress
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                {workouts.length} {workouts.length === 1 ? "workout" : "workouts"} logged
              </p>
            </div>
            {workouts.length > 0 && (
              <Button
                onClick={clearAllWorkouts}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {workouts.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Activity className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No workouts logged yet</h3>
              <p className="text-muted-foreground mb-6">Start logging your workouts to track your progress!</p>
              <Button
                onClick={() => (window.location.href = "/workouts")}
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
              >
                Log Your First Workout
              </Button>
            </Card>
          ) : (
            <div className="space-y-8">
              {groupedWorkouts.map((group, groupIndex) => {
                const categorizedWorkouts = groupWorkoutsByCategory(group.workouts)

                return (
                  <div key={groupIndex} className="space-y-6">
                    {/* Date Header */}
                    <div className="flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-primary" />
                      <h2 className="text-3xl font-bold text-foreground">{group.date}</h2>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    {/* Cardio Section */}
                    {categorizedWorkouts.cardio.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${categoryConfig.cardio.iconBg}`}>
                            <categoryConfig.cardio.icon className={`w-5 h-5 ${categoryConfig.cardio.iconColor}`} />
                          </div>
                          <h3
                            className={`text-xl font-bold ${categoryConfig.cardio.textColor} bg-gradient-to-r ${categoryConfig.cardio.gradient} bg-clip-text text-transparent`}
                          >
                            {categoryConfig.cardio.title}
                          </h3>
                        </div>
                        <div className="grid gap-3">
                          {categorizedWorkouts.cardio.map((workout, idx) => (
                            <Card
                              key={idx}
                              className={`p-4 bg-gradient-to-br ${categoryConfig.cardio.bgGradient} border-2 border-red-200 hover:shadow-lg transition-all`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium text-muted-foreground">
                                      {formatTime(workout.timestamp)}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {workout.exercises.map((exercise, i) => (
                                      <span
                                        key={i}
                                        className="px-3 py-1 bg-white/80 text-red-700 rounded-full text-sm font-semibold capitalize shadow-sm"
                                      >
                                        {exercise}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-red-600" />
                                      <span className="font-semibold">{workout.duration} min</span>
                                    </div>
                                    {workout.calories && (
                                      <div className="flex items-center gap-2">
                                        <Flame className="w-4 h-4 text-orange-500" />
                                        <span className="font-semibold">{workout.calories} cal</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <TrendingUp className="w-4 h-4 text-red-600" />
                                      <span className="font-semibold">Intensity: {workout.intensity}/10</span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteWorkout(workout.timestamp, workout.category)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-100"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Strength Section */}
                    {categorizedWorkouts.strength.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${categoryConfig.strength.iconBg}`}>
                            <categoryConfig.strength.icon className={`w-5 h-5 ${categoryConfig.strength.iconColor}`} />
                          </div>
                          <h3
                            className={`text-xl font-bold ${categoryConfig.strength.textColor} bg-gradient-to-r ${categoryConfig.strength.gradient} bg-clip-text text-transparent`}
                          >
                            {categoryConfig.strength.title}
                          </h3>
                        </div>
                        <div className="grid gap-3">
                          {categorizedWorkouts.strength.map((workout, idx) => (
                            <Card
                              key={idx}
                              className={`p-4 bg-gradient-to-br ${categoryConfig.strength.bgGradient} border-2 border-blue-200 hover:shadow-lg transition-all`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium text-muted-foreground">
                                      {formatTime(workout.timestamp)}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {workout.exercises.map((exercise, i) => (
                                      <span
                                        key={i}
                                        className="px-3 py-1 bg-white/80 text-blue-700 rounded-full text-sm font-semibold capitalize shadow-sm"
                                      >
                                        {exercise}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-blue-600" />
                                      <span className="font-semibold">{workout.duration} min</span>
                                    </div>
                                    {workout.sets && workout.reps && (
                                      <div className="flex items-center gap-2">
                                        <Dumbbell className="w-4 h-4 text-blue-600" />
                                        <span className="font-semibold">
                                          {workout.sets} sets × {workout.reps} reps
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <TrendingUp className="w-4 h-4 text-blue-600" />
                                      <span className="font-semibold">Intensity: {workout.intensity}/10</span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteWorkout(workout.timestamp, workout.category)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mind & Body Section */}
                    {categorizedWorkouts.mindBody.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${categoryConfig.mindBody.iconBg}`}>
                            <categoryConfig.mindBody.icon className={`w-5 h-5 ${categoryConfig.mindBody.iconColor}`} />
                          </div>
                          <h3
                            className={`text-xl font-bold ${categoryConfig.mindBody.textColor} bg-gradient-to-r ${categoryConfig.mindBody.gradient} bg-clip-text text-transparent`}
                          >
                            {categoryConfig.mindBody.title}
                          </h3>
                        </div>
                        <div className="grid gap-3">
                          {categorizedWorkouts.mindBody.map((workout, idx) => (
                            <Card
                              key={idx}
                              className={`p-4 bg-gradient-to-br ${categoryConfig.mindBody.bgGradient} border-2 border-green-200 hover:shadow-lg transition-all`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium text-muted-foreground">
                                      {formatTime(workout.timestamp)}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {workout.exercises.map((exercise, i) => (
                                      <span
                                        key={i}
                                        className="px-3 py-1 bg-white/80 text-green-700 rounded-full text-sm font-semibold capitalize shadow-sm"
                                      >
                                        {exercise}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-green-600" />
                                      <span className="font-semibold">{workout.duration} min</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <TrendingUp className="w-4 h-4 text-green-600" />
                                      <span className="font-semibold">Intensity: {workout.intensity}/10</span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteWorkout(workout.timestamp, workout.category)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-100"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
