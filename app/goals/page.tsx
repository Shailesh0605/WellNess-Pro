"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingDown,
  TrendingUp,
  Scale,
  Dumbbell,
  Target,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Trophy,
} from "lucide-react"

interface Goal {
  id: string
  type: "weight" | "workout" | "habits"
  startDate: string
  endDate?: string
  status: "active" | "paused" | "archived" | "finished"
  finishedDate?: string
  // Weight goal fields
  currentWeight?: number
  targetWeight?: number
  planPerWeek?: number
  height?: number
  age?: number
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very-active"
  gender?: "male" | "female"
  // Workout goal fields
  targetPerWeek?: number
  categories?: string[]
  // Habit goal fields
  stepsTarget?: number
  waterTargetMl?: number
  sleepTargetHrs?: number
}

interface FitnessPlan {
  goalId: string
  createdDate: string
  // User stats
  currentWeight: number
  height: number
  age: number
  activityLevel: string
  gender: string
  bmr: number
  tdee: number
  // Goal details
  goalType: string
  targetWeight: number
  targetDate: string
  timeline: number
  weeklyTarget: number
  intensity: string
  // Diet plan
  dailyCalories: number
  protein: number
  carbs: number
  fat: number
  meals: {
    name: string
    calories: number
    foods: { name: string; portion: string; calories: number }[]
  }[]
  // Workout plan
  workoutPlan: { day: number; workout: string }[]
  // Progress tracking
  progressTips: string[]
}

interface CheckIn {
  date: string
  goalId: string
  weight?: number
  workouts?: number
  steps?: number
  waterMl?: number
  sleepHrs?: number
}

interface Streak {
  goalId: string
  current: number
  best: number
  lastDate: string
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [checkins, setCheckins] = useState<CheckIn[]>([])
  const [streaks, setStreaks] = useState<Streak[]>([])
  const [fitnessPlans, setFitnessPlans] = useState<FitnessPlan[]>([])
  const [viewingPlan, setViewingPlan] = useState<FitnessPlan | null>(null)

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const [wizardData, setWizardData] = useState<Partial<Goal>>({
    type: "weight",
    status: "active",
    startDate: new Date().toISOString().split("T")[0],
  })

  // Check-in dialog state
  const [checkinOpen, setCheckinOpen] = useState(false)
  const [checkinData, setCheckinData] = useState<Partial<CheckIn>>({})

  const [celebrationOpen, setCelebrationOpen] = useState(false)
  const [celebrationGoal, setCelebrationGoal] = useState<Goal | null>(null)

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    const storedGoals = localStorage.getItem("goals")
    const storedCheckins = localStorage.getItem("checkins")
    const storedStreaks = localStorage.getItem("streaks")
    const storedPlans = localStorage.getItem("fitnessPlans")

    if (storedGoals) setGoals(JSON.parse(storedGoals))
    if (storedCheckins) setCheckins(JSON.parse(storedCheckins))
    if (storedStreaks) setStreaks(JSON.parse(storedStreaks))
    if (storedPlans) setFitnessPlans(JSON.parse(storedPlans))
  }, [])

  const saveGoals = (newGoals: Goal[]) => {
    localStorage.setItem("goals", JSON.stringify(newGoals))
    setGoals(newGoals)
  }

  const saveCheckins = (newCheckins: CheckIn[]) => {
    localStorage.setItem("checkins", JSON.stringify(newCheckins))
    setCheckins(newCheckins)
  }

  const saveStreaks = (newStreaks: Streak[]) => {
    localStorage.setItem("streaks", JSON.stringify(newStreaks))
    setStreaks(newStreaks)
  }

  const saveFitnessPlans = (newPlans: FitnessPlan[]) => {
    localStorage.setItem("fitnessPlans", JSON.stringify(newPlans))
    setFitnessPlans(newPlans)
  }

  const calculateBMR = (weight: number, height: number, age: number, gender: string): number => {
    // Mifflin-St Jeor Equation
    if (gender === "male") {
      return 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161
    }
  }

  const calculateTDEE = (bmr: number, activityLevel: string): number => {
    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      "very-active": 1.9,
    }
    return Math.round(bmr * (multipliers[activityLevel] || 1.55))
  }

  const generateFitnessPlan = (goal: Goal): FitnessPlan => {
    const bmr = calculateBMR(goal.currentWeight!, goal.height!, goal.age!, goal.gender || "male")
    const tdee = calculateTDEE(bmr, goal.activityLevel || "moderate")

    // Calculate daily calorie target based on weekly weight change goal
    const weeklyCalorieDeficit = (goal.planPerWeek || 0) * 7700 // 1kg = 7700 calories
    const dailyCalorieAdjustment = weeklyCalorieDeficit / 7
    const dailyCalories = Math.round(tdee + dailyCalorieAdjustment)

    let proteinRatio = 0.3
    let carbsRatio = 0.4
    let fatRatio = 0.3

    const isWeightLoss = (goal.planPerWeek || 0) < 0
    const isWeightGain = (goal.planPerWeek || 0) > 0

    if (isWeightLoss) {
      // Higher protein for weight loss to preserve muscle
      proteinRatio = 0.35
      carbsRatio = 0.35
      fatRatio = 0.3
    } else if (isWeightGain) {
      // Higher carbs for weight gain and muscle building
      proteinRatio = 0.3
      carbsRatio = 0.45
      fatRatio = 0.25
    }

    const protein = Math.round((dailyCalories * proteinRatio) / 4)
    const carbs = Math.round((dailyCalories * carbsRatio) / 4)
    const fat = Math.round((dailyCalories * fatRatio) / 9)

    // Determine intensity
    const intensity =
      Math.abs(goal.planPerWeek || 0) > 0.7
        ? "aggressive"
        : Math.abs(goal.planPerWeek || 0) > 0.3
          ? "moderate"
          : "gentle"

    const breakfastCal = Math.round(dailyCalories * 0.25)
    const lunchCal = Math.round(dailyCalories * 0.35)
    const dinnerCal = Math.round(dailyCalories * 0.3)
    const snacksCal = dailyCalories - breakfastCal - lunchCal - dinnerCal

    let meals: {
      name: string
      calories: number
      foods: { name: string; portion: string; calories: number }[]
    }[] = []

    if (isWeightLoss) {
      // Weight loss meal plan - high protein, moderate carbs
      meals = [
        {
          name: "Breakfast",
          calories: breakfastCal,
          foods: [
            { name: "Egg white omelette", portion: "3 eggs", calories: Math.round(breakfastCal * 0.4) },
            { name: "Whole wheat toast", portion: "1 slice", calories: Math.round(breakfastCal * 0.3) },
            { name: "Avocado", portion: "1/4 medium", calories: Math.round(breakfastCal * 0.3) },
          ],
        },
        {
          name: "Lunch",
          calories: lunchCal,
          foods: [
            { name: "Grilled chicken breast", portion: "150g", calories: Math.round(lunchCal * 0.5) },
            { name: "Mixed green salad", portion: "2 cups", calories: Math.round(lunchCal * 0.1) },
            { name: "Sweet potato", portion: "100g", calories: Math.round(lunchCal * 0.25) },
            { name: "Olive oil dressing", portion: "1 tbsp", calories: Math.round(lunchCal * 0.15) },
          ],
        },
        {
          name: "Dinner",
          calories: dinnerCal,
          foods: [
            { name: "Grilled salmon", portion: "150g", calories: Math.round(dinnerCal * 0.6) },
            { name: "Steamed broccoli", portion: "1.5 cups", calories: Math.round(dinnerCal * 0.15) },
            { name: "Cauliflower rice", portion: "1 cup", calories: Math.round(dinnerCal * 0.25) },
          ],
        },
        {
          name: "Snacks",
          calories: snacksCal,
          foods: [
            { name: "Greek yogurt (low-fat)", portion: "150g", calories: Math.round(snacksCal * 0.6) },
            { name: "Berries", portion: "1/2 cup", calories: Math.round(snacksCal * 0.4) },
          ],
        },
      ]
    } else if (isWeightGain) {
      // Weight gain meal plan - higher calories, more carbs
      meals = [
        {
          name: "Breakfast",
          calories: breakfastCal,
          foods: [
            { name: "Oatmeal with whole milk", portion: "1.5 cups", calories: Math.round(breakfastCal * 0.4) },
            { name: "Banana", portion: "1 large", calories: Math.round(breakfastCal * 0.25) },
            { name: "Peanut butter", portion: "2 tbsp", calories: Math.round(breakfastCal * 0.35) },
          ],
        },
        {
          name: "Lunch",
          calories: lunchCal,
          foods: [
            { name: "Grilled chicken thigh", portion: "200g", calories: Math.round(lunchCal * 0.45) },
            { name: "Brown rice", portion: "1.5 cups cooked", calories: Math.round(lunchCal * 0.35) },
            { name: "Mixed vegetables", portion: "1 cup", calories: Math.round(lunchCal * 0.1) },
            { name: "Olive oil", portion: "1 tbsp", calories: Math.round(lunchCal * 0.1) },
          ],
        },
        {
          name: "Dinner",
          calories: dinnerCal,
          foods: [
            { name: "Beef steak", portion: "200g", calories: Math.round(dinnerCal * 0.55) },
            { name: "Baked potato", portion: "1 large", calories: Math.round(dinnerCal * 0.3) },
            { name: "Grilled asparagus", portion: "1 cup", calories: Math.round(dinnerCal * 0.15) },
          ],
        },
        {
          name: "Snacks",
          calories: snacksCal,
          foods: [
            { name: "Protein shake with milk", portion: "1 scoop + 300ml", calories: Math.round(snacksCal * 0.5) },
            { name: "Mixed nuts", portion: "30g", calories: Math.round(snacksCal * 0.5) },
          ],
        },
      ]
    } else {
      // Maintenance meal plan - balanced
      meals = [
        {
          name: "Breakfast",
          calories: breakfastCal,
          foods: [
            { name: "Oatmeal with berries", portion: "1 cup", calories: Math.round(breakfastCal * 0.45) },
            { name: "Greek yogurt", portion: "1/2 cup", calories: Math.round(breakfastCal * 0.3) },
            { name: "Almonds", portion: "10 nuts", calories: Math.round(breakfastCal * 0.25) },
          ],
        },
        {
          name: "Lunch",
          calories: lunchCal,
          foods: [
            { name: "Grilled chicken breast", portion: "120g", calories: Math.round(lunchCal * 0.45) },
            { name: "Quinoa", portion: "3/4 cup cooked", calories: Math.round(lunchCal * 0.3) },
            { name: "Mixed salad", portion: "2 cups", calories: Math.round(lunchCal * 0.1) },
            { name: "Olive oil dressing", portion: "1 tbsp", calories: Math.round(lunchCal * 0.15) },
          ],
        },
        {
          name: "Dinner",
          calories: dinnerCal,
          foods: [
            { name: "Baked salmon", portion: "150g", calories: Math.round(dinnerCal * 0.55) },
            { name: "Brown rice", portion: "1/2 cup cooked", calories: Math.round(dinnerCal * 0.25) },
            { name: "Steamed vegetables", portion: "1.5 cups", calories: Math.round(dinnerCal * 0.2) },
          ],
        },
        {
          name: "Snacks",
          calories: snacksCal,
          foods: [
            { name: "Apple", portion: "1 medium", calories: Math.round(snacksCal * 0.5) },
            { name: "String cheese", portion: "1 piece", calories: Math.round(snacksCal * 0.5) },
          ],
        },
      ]
    }

    let workoutPlan: { day: number; workout: string }[] = []

    const age = goal.age || 25
    const gender = goal.gender || "male"
    const activityLevel = goal.activityLevel || "moderate"

    if (isWeightLoss) {
      if (intensity === "aggressive") {
        // High intensity weight loss - more cardio
        workoutPlan = [
          { day: 1, workout: age > 50 ? "40 min Brisk Walking" : "45 min Running (moderate pace)" },
          { day: 2, workout: "35 min HIIT Training (high intensity intervals)" },
          {
            day: 3,
            workout: gender === "male" ? "Strength Training (Upper Body focus)" : "Strength Training (Full Body)",
          },
          { day: 4, workout: "45 min Cycling (moderate-high intensity)" },
          { day: 5, workout: "30 min HIIT Training + 15 min Core" },
          {
            day: 6,
            workout: gender === "male" ? "Strength Training (Lower Body focus)" : "Strength Training (Full Body)",
          },
          {
            day: 7,
            workout: age > 50 ? "30 min Light Walking + Stretching" : "30 min Light Cardio (Swimming or Walking)",
          },
        ]
      } else if (intensity === "moderate") {
        workoutPlan = [
          { day: 1, workout: "30 min Cardio (Running or Cycling)" },
          { day: 2, workout: "Strength Training (Upper Body)" },
          { day: 3, workout: "Rest or Gentle Yoga" },
          { day: 4, workout: "30 min Cardio (Swimming or Elliptical)" },
          { day: 5, workout: "Strength Training (Lower Body)" },
          { day: 6, workout: "25 min HIIT Training" },
          { day: 7, workout: "Rest or 20 min Walking" },
        ]
      } else {
        // Gentle weight loss
        workoutPlan = [
          { day: 1, workout: "25 min Brisk Walking" },
          { day: 2, workout: "Light Strength Training (Full Body)" },
          { day: 3, workout: "Rest or Gentle Stretching" },
          { day: 4, workout: "25 min Swimming or Water Aerobics" },
          { day: 5, workout: "Light Strength Training (Full Body)" },
          { day: 6, workout: "20 min Yoga or Pilates" },
          { day: 7, workout: "Rest" },
        ]
      }
    } else if (isWeightGain) {
      if (intensity === "aggressive") {
        // Muscle building focus
        workoutPlan = [
          { day: 1, workout: "Strength Training (Chest & Triceps) - Heavy weights" },
          { day: 2, workout: "Strength Training (Back & Biceps) - Heavy weights" },
          { day: 3, workout: "20 min Light Cardio + Stretching" },
          { day: 4, workout: "Strength Training (Legs & Glutes) - Heavy weights" },
          { day: 5, workout: "Strength Training (Shoulders & Core)" },
          { day: 6, workout: "Full Body Compound Exercises" },
          { day: 7, workout: "Rest or Light Yoga" },
        ]
      } else if (intensity === "moderate") {
        workoutPlan = [
          { day: 1, workout: "Strength Training (Upper Body)" },
          { day: 2, workout: "15 min Light Cardio" },
          { day: 3, workout: "Strength Training (Lower Body)" },
          { day: 4, workout: "Rest or Yoga" },
          { day: 5, workout: "Strength Training (Full Body)" },
          { day: 6, workout: "20 min Cardio + Core Work" },
          { day: 7, workout: "Rest" },
        ]
      } else {
        workoutPlan = [
          { day: 1, workout: "Light Strength Training (Upper Body)" },
          { day: 2, workout: "Rest or Gentle Stretching" },
          { day: 3, workout: "Light Strength Training (Lower Body)" },
          { day: 4, workout: "Rest or Yoga" },
          { day: 5, workout: "Light Strength Training (Full Body)" },
          { day: 6, workout: "15 min Light Cardio" },
          { day: 7, workout: "Rest" },
        ]
      }
    } else {
      // Maintenance - balanced approach
      if (activityLevel === "sedentary" || activityLevel === "light") {
        workoutPlan = [
          { day: 1, workout: "30 min Cardio (Walking or Cycling)" },
          { day: 2, workout: "Strength Training (Full Body)" },
          { day: 3, workout: "Rest or Yoga" },
          { day: 4, workout: "30 min Cardio (Swimming)" },
          { day: 5, workout: "Strength Training (Full Body)" },
          { day: 6, workout: "Rest or Stretching" },
          { day: 7, workout: "Rest" },
        ]
      } else {
        workoutPlan = [
          { day: 1, workout: "35 min Cardio (Running)" },
          { day: 2, workout: "Strength Training (Upper Body)" },
          { day: 3, workout: "Yoga or Pilates" },
          { day: 4, workout: "35 min Cardio (Cycling)" },
          { day: 5, workout: "Strength Training (Lower Body)" },
          { day: 6, workout: "25 min HIIT or Sports Activity" },
          { day: 7, workout: "Rest or Light Activity" },
        ]
      }
    }

    const progressTips = [
      "Weekly weigh-ins recommended (same time, same day)",
      "Track body measurements monthly (waist, hips, chest)",
      "Adjust plan every 4 weeks based on progress",
      "Stay consistent with your routine for best results",
      isWeightLoss ? "Drink plenty of water to support fat loss" : "Ensure adequate protein intake for muscle growth",
    ]

    const timelineWeeks = goal.endDate
      ? Math.ceil((new Date(goal.endDate).getTime() - new Date(goal.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7))
      : Math.ceil(Math.abs((goal.targetWeight! - goal.currentWeight!) / (goal.planPerWeek || 0.5)))

    return {
      goalId: goal.id,
      createdDate: today,
      currentWeight: goal.currentWeight!,
      height: goal.height!,
      age: goal.age!,
      activityLevel: goal.activityLevel || "moderate",
      gender: goal.gender || "male",
      bmr: Math.round(bmr),
      tdee,
      goalType:
        (goal.planPerWeek || 0) < 0 ? "WEIGHT LOSS" : (goal.planPerWeek || 0) > 0 ? "WEIGHT GAIN" : "MAINTENANCE",
      targetWeight: goal.targetWeight!,
      targetDate:
        goal.endDate || new Date(Date.now() + timelineWeeks * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      timeline: timelineWeeks,
      weeklyTarget: goal.planPerWeek!,
      intensity,
      dailyCalories,
      protein,
      carbs,
      fat,
      meals,
      workoutPlan,
      progressTips,
    }
  }

  const openWizard = (goalId?: string) => {
    if (goalId) {
      const goal = goals.find((g) => g.id === goalId)
      if (goal) {
        setWizardData(goal)
        setEditingGoalId(goalId)
      }
    } else {
      setWizardData({
        type: "weight",
        status: "active",
        startDate: today,
      })
      setEditingGoalId(null)
    }
    setWizardStep(1)
    setWizardOpen(true)
  }

  const startGoalCreation = (type: "weight-loss" | "weight-gain" | "maintenance") => {
    if (type === "weight-loss") {
      setWizardData({
        type: "weight",
        status: "active",
        startDate: today,
        planPerWeek: -0.5, // Default to losing 0.5kg per week
      })
    } else if (type === "weight-gain") {
      setWizardData({
        type: "weight",
        status: "active",
        startDate: today,
        planPerWeek: 0.5, // Default to gaining 0.5kg per week
      })
    } else {
      setWizardData({
        type: "weight",
        status: "active",
        startDate: today,
        planPerWeek: 0, // Maintenance
      })
    }
    setEditingGoalId(null)
    setWizardStep(2) // Skip type selection, go straight to configuration
    setWizardOpen(true)
  }

  const nextWizardStep = () => {
    if (wizardStep < 4) setWizardStep(wizardStep + 1)
  }

  const prevWizardStep = () => {
    if (wizardStep > 1) setWizardStep(wizardStep - 1)
  }

  const validateAndSaveGoal = () => {
    if (wizardData.type === "weight") {
      if (
        !wizardData.currentWeight ||
        !wizardData.targetWeight ||
        !wizardData.planPerWeek ||
        !wizardData.height ||
        !wizardData.age ||
        !wizardData.activityLevel ||
        !wizardData.gender ||
        wizardData.currentWeight < 20 ||
        wizardData.currentWeight > 300 ||
        wizardData.targetWeight < 20 ||
        wizardData.targetWeight > 300 ||
        wizardData.currentWeight === wizardData.targetWeight ||
        wizardData.planPerWeek < -1.5 ||
        wizardData.planPerWeek > 1.5 ||
        wizardData.height < 100 ||
        wizardData.height > 250 ||
        wizardData.age < 10 ||
        wizardData.age > 100
      ) {
        alert("Please fill in all required fields with valid values")
        return
      }
    } else if (wizardData.type === "workout") {
      if (!wizardData.targetPerWeek || wizardData.targetPerWeek < 1 || wizardData.targetPerWeek > 7) {
        alert("Workout frequency must be between 1-7 per week")
        return
      }
    } else if (wizardData.type === "habits") {
      if (wizardData.stepsTarget !== undefined && (wizardData.stepsTarget < 0 || wizardData.stepsTarget > 50000)) {
        alert("Steps must be between 0-50,000")
        return
      }
      if (wizardData.waterTargetMl !== undefined && (wizardData.waterTargetMl < 0 || wizardData.waterTargetMl > 8000)) {
        alert("Water must be between 0-8000 ml")
        return
      }
      if (
        wizardData.sleepTargetHrs !== undefined &&
        (wizardData.sleepTargetHrs < 0 || wizardData.sleepTargetHrs > 16)
      ) {
        alert("Sleep must be between 0-16 hours")
        return
      }
    }

    if (wizardData.endDate && wizardData.startDate && wizardData.endDate < wizardData.startDate) {
      alert("End date must be after start date")
      return
    }

    const newGoal: Goal = {
      ...wizardData,
      id: editingGoalId || `goal-${Date.now()}`,
      status: "active", // Ensure new goals are active
    } as Goal

    if (editingGoalId) {
      saveGoals(goals.map((g) => (g.id === editingGoalId ? newGoal : g)))
    } else {
      saveGoals([...goals, newGoal])
      // Initialize streak
      saveStreaks([...streaks, { goalId: newGoal.id, current: 0, best: 0, lastDate: "" }])

      if (newGoal.type === "weight") {
        const plan = generateFitnessPlan(newGoal)
        saveFitnessPlans([...fitnessPlans, plan])
        setViewingPlan(plan)
      }
    }

    setWizardOpen(false)
    setWizardData({
      type: "weight",
      status: "active",
      startDate: today,
    })
    setEditingGoalId(null)
  }

  const viewPlan = (goalId: string) => {
    const plan = fitnessPlans.find((p) => p.goalId === goalId)
    if (plan) {
      setViewingPlan(plan)
    }
  }

  const openCheckin = () => {
    setCheckinData({ date: today })
    setCheckinOpen(true)
  }

  const saveCheckin = () => {
    const activeGoals = goals.filter((g) => g.status === "active")

    activeGoals.forEach((goal) => {
      const newCheckin: CheckIn = {
        date: today,
        goalId: goal.id,
      }

      if (goal.type === "weight" && checkinData.weight !== undefined) {
        newCheckin.weight = checkinData.weight
      } else if (goal.type === "workout" && checkinData.workouts !== undefined) {
        newCheckin.workouts = checkinData.workouts
      } else if (goal.type === "habits") {
        if (checkinData.steps !== undefined) newCheckin.steps = checkinData.steps
        if (checkinData.waterMl !== undefined) newCheckin.waterMl = checkinData.waterMl
        if (checkinData.sleepHrs !== undefined) newCheckin.sleepHrs = checkinData.sleepHrs
      }

      // Remove existing check-in for today and this goal
      const filteredCheckins = checkins.filter((c) => !(c.date === today && c.goalId === goal.id))
      saveCheckins([...filteredCheckins, newCheckin])

      // Update streaks
      updateStreak(goal, newCheckin)
    })

    setCheckinOpen(false)
    setCheckinData({})
  }

  const updateStreak = (goal: Goal, checkin: CheckIn) => {
    const streak = streaks.find((s) => s.goalId === goal.id)
    if (!streak) return

    let metTarget = false

    if (goal.type === "workout" && checkin.workouts !== undefined && goal.targetPerWeek) {
      // Check if weekly target is met
      const thisWeekCheckins = checkins.filter((c) => {
        const checkinDate = new Date(c.date)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return c.goalId === goal.id && checkinDate >= weekAgo
      })
      const totalWorkouts = thisWeekCheckins.reduce((sum, c) => sum + (c.workouts || 0), 0) + checkin.workouts
      metTarget = totalWorkouts >= goal.targetPerWeek
    } else if (goal.type === "habits") {
      metTarget =
        (goal.stepsTarget !== undefined ? (checkin.steps || 0) >= goal.stepsTarget : true) &&
        (goal.waterTargetMl !== undefined ? (checkin.waterMl || 0) >= goal.waterTargetMl : true) &&
        (goal.sleepTargetHrs !== undefined ? (checkin.sleepHrs || 0) >= goal.sleepTargetHrs : true)
    } else if (goal.type === "weight") {
      metTarget = true // Weight check-ins always count
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    const newStreak = { ...streak }
    if (metTarget) {
      if (streak.lastDate === yesterdayStr || streak.lastDate === today) {
        newStreak.current += 1
      } else {
        newStreak.current = 1
      }
      newStreak.best = Math.max(newStreak.best, newStreak.current)
      newStreak.lastDate = today
    } else {
      newStreak.current = 0
    }

    saveStreaks(streaks.map((s) => (s.goalId === goal.id ? newStreak : s)))
  }

  const pauseGoal = (goalId: string) => {
    saveGoals(goals.map((g) => (g.id === goalId ? { ...g, status: "paused" } : g)))
  }

  const archiveGoal = (goalId: string) => {
    saveGoals(goals.map((g) => (g.id === goalId ? { ...g, status: "archived" } : g)))
  }

  const checkGoalAchievement = (goal: Goal): boolean => {
    if (goal.type === "weight") {
      const progress = getWeightProgress(goal)
      if (!progress) return false

      const isLoss = (goal.planPerWeek || 0) < 0
      const isGain = (goal.planPerWeek || 0) > 0

      // Ensure targetWeight is a number before comparison
      if (typeof goal.targetWeight === "number") {
        if (isLoss && progress.current <= goal.targetWeight) {
          return true
        } else if (isGain && progress.current >= goal.targetWeight) {
          return true
        }
      }
    }
    // For workout and habit goals, achievement can be considered based on reaching targets consistently
    // This is a simplification; more complex logic could be added
    if (goal.type === "workout" && goal.targetPerWeek) {
      // This is a placeholder. A real implementation would check cumulative progress.
      return false
    }
    if (goal.type === "habits") {
      // This is a placeholder. A real implementation would check cumulative progress.
      return false
    }
    return false
  }

  const finishGoal = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return

    const isAchieved = checkGoalAchievement(goal)

    if (isAchieved) {
      setCelebrationGoal(goal)
      setCelebrationOpen(true)
    }

    saveGoals(goals.map((g) => (g.id === goalId ? { ...g, status: "finished" as const, finishedDate: today } : g)))
  }

  const deleteGoal = (goalId: string) => {
    if (confirm("Are you sure you want to delete this goal? This action cannot be undone.")) {
      saveGoals(goals.filter((g) => g.id !== goalId))
      // Also remove associated checkins and streaks
      saveCheckins(checkins.filter((c) => c.goalId !== goalId))
      saveStreaks(streaks.filter((s) => s.goalId !== goalId))
      saveFitnessPlans(fitnessPlans.filter((p) => p.goalId !== goalId))
    }
  }

  const getWeightProgress = (goal: Goal) => {
    if (!goal.currentWeight || !goal.targetWeight || !goal.planPerWeek) return null

    const recentCheckins = checkins
      .filter((c) => c.goalId === goal.id && c.weight !== undefined) // Ensure weight is present
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const latestWeight = recentCheckins.length > 0 ? recentCheckins[0].weight! : goal.currentWeight!
    const totalChange = Math.abs(goal.targetWeight - goal.currentWeight)
    const currentChange = Math.abs(latestWeight - goal.currentWeight)
    const progress = totalChange === 0 ? 100 : (currentChange / totalChange) * 100

    // Calculate expected progress
    const daysSinceStart = Math.floor(
      (new Date().getTime() - new Date(goal.startDate).getTime()) / (1000 * 60 * 60 * 24),
    )
    const weeksSinceStart = daysSinceStart / 7
    const expectedChange = Math.abs(goal.planPerWeek * weeksSinceStart)
    const expectedProgress = totalChange === 0 ? 100 : (expectedChange / totalChange) * 100

    let status = "on-track"
    if (currentChange > expectedChange + Math.abs(goal.planPerWeek)) status = "ahead"
    else if (currentChange < expectedChange - Math.abs(goal.planPerWeek)) status = "behind"

    return {
      current: latestWeight,
      progress: Math.min(progress, 100),
      status,
      trend: recentCheckins.slice(0, 7).reverse(),
    }
  }

  const getWorkoutProgress = (goal: Goal) => {
    if (!goal.targetPerWeek) return null

    // Get workouts from logged workouts
    // Assuming "workouts" is stored in localStorage in a similar way to goals
    const workoutsData = localStorage.getItem("workouts")
    const allWorkouts = workoutsData ? JSON.parse(workoutsData) : []

    const thisWeekWorkouts = allWorkouts.filter((w: any) => {
      const workoutDate = new Date(w.timestamp)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return workoutDate >= weekAgo
    }).length

    const progress = (thisWeekWorkouts / goal.targetPerWeek) * 100
    const streak = streaks.find((s) => s.goalId === goal.id)

    return {
      current: thisWeekWorkouts,
      target: goal.targetPerWeek,
      progress: Math.min(progress, 100),
      streak: streak?.current || 0,
    }
  }

  const getHabitProgress = (goal: Goal) => {
    const todayCheckin = checkins.find((c) => c.goalId === goal.id && c.date === today)
    const streak = streaks.find((s) => s.goalId === goal.id)

    return {
      steps: {
        current: todayCheckin?.steps || 0,
        target: goal.stepsTarget || 0,
        progress: goal.stepsTarget && goal.stepsTarget > 0 ? ((todayCheckin?.steps || 0) / goal.stepsTarget) * 100 : 0,
      },
      water: {
        current: todayCheckin?.waterMl || 0,
        target: goal.waterTargetMl || 0,
        progress:
          goal.waterTargetMl && goal.waterTargetMl > 0 ? ((todayCheckin?.waterMl || 0) / goal.waterTargetMl) * 100 : 0,
      },
      sleep: {
        current: todayCheckin?.sleepHrs || 0,
        target: goal.sleepTargetHrs || 0,
        progress:
          goal.sleepTargetHrs && goal.sleepTargetHrs > 0
            ? ((todayCheckin?.sleepHrs || 0) / goal.sleepTargetHrs) * 100
            : 0,
      },
      streak: streak?.current || 0,
    }
  }

  const activeGoals = goals.filter((g) => g.status === "active")
  const finishedGoals = goals.filter((g) => g.status === "finished")

  return (
    <div className="flex min-h-screen bg-green-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 mb-8 bg-white/95 backdrop-blur">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Personalized Fitness Coach</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Set your goals and get personalized workout & diet recommendations
            </p>
          </Card>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center">
                <span className="text-lg">📋</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Step 1: Choose Your Goal</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Weight Loss Card */}
              <button
                onClick={() => startGoalCreation("weight-loss")}
                className="p-8 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:scale-105 transition-transform shadow-xl"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Weight Loss</h3>
                <p className="text-purple-100">Lose weight safely and sustainably</p>
              </button>

              {/* Weight Gain Card */}
              <button
                onClick={() => startGoalCreation("weight-gain")}
                className="p-8 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:scale-105 transition-transform shadow-xl"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Weight Gain</h3>
                <p className="text-purple-100">Build muscle and gain healthy weight</p>
              </button>

              {/* Maintenance Card */}
              <button
                onClick={() => startGoalCreation("maintenance")}
                className="p-8 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:scale-105 transition-transform shadow-xl"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-xl flex items-center justify-center">
                  <Scale className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Maintenance</h3>
                <p className="text-purple-100">Maintain current weight and fitness</p>
              </button>
            </div>
          </div>

          {/* CHANGE START */}
          {activeGoals.length > 0 && (
            <div className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border-2 border-blue-400/30">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Active Goals
                  </h2>
                  <p className="text-blue-700 text-sm mt-1">Track your ongoing fitness journey</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {activeGoals.map((goal) => {
                  if (goal.type === "weight") {
                    const progress = getWeightProgress(goal)
                    const isLoss = (goal.planPerWeek || 0) < 0
                    const intensity =
                      Math.abs(goal.planPerWeek || 0) > 0.7
                        ? "aggressive"
                        : Math.abs(goal.planPerWeek || 0) > 0.3
                          ? "moderate"
                          : "gentle"

                    return (
                      // CHANGE: Changed from purple to blue gradient for active goals
                      <Card
                        key={goal.id}
                        className="p-6 bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-xl"
                      >
                        <div className="flex items-start justify-between mb-6">
                          <h3 className="text-xl font-bold">WEIGHT {isLoss ? "LOSS" : "GAIN"} Goal</h3>
                          <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium">{intensity}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="p-4 rounded-lg bg-white/10">
                            <p className="text-purple-200 text-sm mb-1">Current Weight</p>
                            <p className="text-2xl font-bold">
                              {progress?.current ?? goal.currentWeight?.toFixed(1)} kg
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-white/10">
                            <p className="text-purple-200 text-sm mb-1">Target Weight</p>
                            <p className="text-2xl font-bold">{goal.targetWeight} kg</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="p-4 rounded-lg bg-white/10">
                            <p className="text-purple-200 text-sm mb-1">Weekly Target</p>
                            <p className="text-xl font-bold">{goal.planPerWeek} kg</p>
                          </div>
                          <div className="p-4 rounded-lg bg-white/10">
                            <p className="text-purple-200 text-sm mb-1">Timeline</p>
                            <p className="text-xl font-bold">
                              {goal.endDate
                                ? `${Math.ceil((new Date(goal.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks`
                                : "Ongoing"}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-white transition-all"
                              style={{ width: `${progress?.progress || 0}%` }}
                            />
                          </div>
                          <p className="text-sm text-purple-200 mt-2">
                            {progress?.progress
                              ? `${Math.round(progress.progress)}% complete`
                              : "No progress tracked yet"}
                          </p>
                        </div>

                        <p className="text-sm text-purple-200 mb-4">
                          Created: {new Date(goal.startDate).toLocaleDateString()}
                        </p>

                        <div className="flex gap-3">
                          <Button
                            onClick={openCheckin}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                          >
                            📊 Track Progress
                          </Button>
                          <Button
                            onClick={() => viewPlan(goal.id)}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                          >
                            🎯 View Plan
                          </Button>
                        </div>

                        <div className="flex gap-3 mt-3">
                          <Button
                            onClick={() => finishGoal(goal.id)}
                            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                          >
                            <Trophy className="w-4 h-4 mr-2" />
                            Mark as Finished
                          </Button>
                          <Button
                            onClick={() => deleteGoal(goal.id)}
                            variant="outline"
                            className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-bold"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    )
                  }

                  if (goal.type === "workout") {
                    const progress = getWorkoutProgress(goal)
                    return (
                      // CHANGE: Changed from purple to blue gradient for active goals
                      <Card
                        key={goal.id}
                        className="p-6 bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-xl"
                      >
                        <div className="flex items-start justify-between mb-6">
                          <h3 className="text-xl font-bold">WORKOUT Goal</h3>
                          <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                            {goal.targetPerWeek}x/week
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="p-4 rounded-lg bg-white/10">
                            <p className="text-purple-200 text-sm mb-1">This Week</p>
                            <p className="text-2xl font-bold">
                              {progress?.current || 0}/{goal.targetPerWeek}
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-white/10">
                            <p className="text-purple-200 text-sm mb-1">Streak</p>
                            <p className="text-2xl font-bold">{progress?.streak || 0} weeks</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-white transition-all"
                              style={{ width: `${progress?.progress || 0}%` }}
                            />
                          </div>
                          <p className="text-sm text-purple-200 mt-2">
                            {progress?.progress
                              ? `${Math.round(progress.progress)}% of weekly goal`
                              : "No progress tracked yet"}
                          </p>
                        </div>

                        <p className="text-sm text-purple-200 mb-4">
                          Created: {new Date(goal.startDate).toLocaleDateString()}
                        </p>

                        <div className="flex gap-3">
                          <Button
                            onClick={openCheckin}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                          >
                            📊 Track Progress
                          </Button>
                          <Button
                            onClick={() => openWizard(goal.id)}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                          >
                            🎯 View Details
                          </Button>
                        </div>

                        <div className="flex gap-3 mt-3">
                          <Button
                            onClick={() => finishGoal(goal.id)}
                            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                          >
                            <Trophy className="w-4 h-4 mr-2" />
                            Mark as Finished
                          </Button>
                          <Button
                            onClick={() => deleteGoal(goal.id)}
                            variant="outline"
                            className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-bold"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    )
                  }

                  if (goal.type === "habits") {
                    const progress = getHabitProgress(goal)
                    return (
                      // CHANGE: Changed from purple to blue gradient for active goals
                      <Card
                        key={goal.id}
                        className="p-6 bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-xl"
                      >
                        <div className="flex items-start justify-between mb-6">
                          <h3 className="text-xl font-bold">DAILY HABITS Goal</h3>
                          <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                            {progress.streak} day streak
                          </span>
                        </div>

                        <div className="space-y-3 mb-6">
                          {goal.stepsTarget !== undefined && goal.stepsTarget > 0 && (
                            <div className="p-4 rounded-lg bg-white/10">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm">Steps</span>
                                <span className="font-bold">
                                  {progress.steps.current}/{progress.steps.target}
                                </span>
                              </div>
                              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-white transition-all"
                                  style={{ width: `${Math.min(progress.steps.progress, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {goal.waterTargetMl !== undefined && goal.waterTargetMl > 0 && (
                            <div className="p-4 rounded-lg bg-white/10">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm">Water</span>
                                <span className="font-bold">
                                  {progress.water.current}/{progress.water.target}ml
                                </span>
                              </div>
                              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-white transition-all"
                                  style={{ width: `${Math.min(progress.water.progress, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {goal.sleepTargetHrs !== undefined && goal.sleepTargetHrs > 0 && (
                            <div className="p-4 rounded-lg bg-white/10">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm">Sleep</span>
                                <span className="font-bold">
                                  {progress.sleep.current}/{progress.sleep.target}h
                                </span>
                              </div>
                              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-white transition-all"
                                  style={{ width: `${Math.min(progress.sleep.progress, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-purple-200 mb-4">
                          Created: {new Date(goal.startDate).toLocaleDateString()}
                        </p>

                        <div className="flex gap-3">
                          <Button
                            onClick={openCheckin}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                          >
                            📊 Track Progress
                          </Button>
                          <Button
                            onClick={() => openWizard(goal.id)}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                          >
                            🎯 View Details
                          </Button>
                        </div>

                        <div className="flex gap-3 mt-3">
                          <Button
                            onClick={() => finishGoal(goal.id)}
                            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                          >
                            <Trophy className="w-4 h-4 mr-2" />
                            Mark as Finished
                          </Button>
                          <Button
                            onClick={() => deleteGoal(goal.id)}
                            variant="outline"
                            className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-bold"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    )
                  }

                  return null
                })}
              </div>
            </div>
          )}
          {/* CHANGE END */}

          {/* CHANGE START */}
          {finishedGoals.length > 0 && (
            // CHANGE: Added prominent section container with celebratory styling
            <div className="p-8 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border-2 border-green-400/30">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Finished Goals
                  </h2>
                  <p className="text-green-700 text-sm mt-1">Celebrate your achievements!</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {finishedGoals.map((goal) => {
                  if (goal.type === "weight") {
                    const isLoss = (goal.planPerWeek || 0) < 0
                    const intensity =
                      Math.abs(goal.planPerWeek || 0) > 0.7
                        ? "aggressive"
                        : Math.abs(goal.planPerWeek || 0) > 0.3
                          ? "moderate"
                          : "gentle"

                    return (
                      <Card
                        key={goal.id}
                        className="p-6 bg-gradient-to-br from-green-500 to-emerald-700 text-white opacity-90"
                      >
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                              <CheckCircle2 className="w-6 h-6 text-yellow-300" />
                              WEIGHT {isLoss ? "LOSS" : "GAIN"} Goal
                            </h3>
                            <p className="text-sm text-green-100 mt-1">
                              Completed on{" "}
                              {goal.finishedDate ? new Date(goal.finishedDate).toLocaleDateString() : "N/A"}
                            </p>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium">{intensity}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="p-4 rounded-lg bg-white/10">
                            <p className="text-green-200 text-sm mb-1">Target Weight</p>
                            <p className="text-2xl font-bold">{goal.targetWeight} kg</p>
                          </div>
                          <div className="p-4 rounded-lg bg-white/10">
                            <p className="text-green-200 text-sm mb-1">Weekly Target</p>
                            <p className="text-xl font-bold">{goal.planPerWeek} kg</p>
                          </div>
                        </div>

                        <Button
                          onClick={() => deleteGoal(goal.id)}
                          variant="outline"
                          className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30 font-bold"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Goal
                        </Button>
                      </Card>
                    )
                  }

                  return (
                    <Card
                      key={goal.id}
                      className="p-6 bg-gradient-to-br from-green-500 to-emerald-700 text-white opacity-90"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-6 h-6 text-yellow-300" />
                            {goal.type === "workout" ? "WORKOUT" : "HABITS"} Goal
                          </h3>
                          <p className="text-sm text-green-100 mt-1">
                            Completed on {goal.finishedDate ? new Date(goal.finishedDate).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() => deleteGoal(goal.id)}
                        variant="outline"
                        className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30 font-bold"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Goal
                      </Button>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
          {/* CHANGE END */}
        </div>
      </main>

      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGoalId ? "Edit Goal" : "Create New Goal"}</DialogTitle>
          </DialogHeader>

          {/* Step 1: Select Goal Type */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold">Step 1: Select Goal Type</h3>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setWizardData({ ...wizardData, type: "weight" })}
                  className={`p-6 rounded-lg border-2 transition-all hover-3d ${
                    wizardData.type === "weight" ? "border-pink-500 bg-pink-50" : "border-muted"
                  }`}
                >
                  <TrendingDown className="w-8 h-8 mx-auto mb-2 text-pink-600" />
                  <p className="font-bold">Weight</p>
                </button>
                <button
                  onClick={() => setWizardData({ ...wizardData, type: "workout" })}
                  className={`p-6 rounded-lg border-2 transition-all hover-3d ${
                    wizardData.type === "workout" ? "border-green-500 bg-green-50" : "border-muted"
                  }`}
                >
                  <Dumbbell className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="font-bold">Workout</p>
                </button>
                <button
                  onClick={() => setWizardData({ ...wizardData, type: "habits" })}
                  className={`p-6 rounded-lg border-2 transition-all hover-3d ${
                    wizardData.type === "habits" ? "border-blue-500 bg-blue-50" : "border-muted"
                  }`}
                >
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-bold">Habits</p>
                </button>
              </div>
              <Button onClick={nextWizardStep} className="w-full">
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Configure Goal */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold">Step 2: Configure Your Goal</h3>

              {wizardData.type === "weight" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Gender</Label>
                      <Select
                        value={wizardData.gender || ""}
                        onValueChange={(value) => setWizardData({ ...wizardData, gender: value as "male" | "female" })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Age (years)</Label>
                      <Input
                        type="number"
                        placeholder="25"
                        value={wizardData.age || ""}
                        onChange={(e) => setWizardData({ ...wizardData, age: Number.parseInt(e.target.value) })}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">10-100 years</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Height (cm)</Label>
                      <Input
                        type="number"
                        placeholder="170"
                        value={wizardData.height || ""}
                        onChange={(e) => setWizardData({ ...wizardData, height: Number.parseInt(e.target.value) })}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">100-250 cm</p>
                    </div>
                    <div>
                      <Label>Activity Level</Label>
                      <Select
                        value={wizardData.activityLevel || ""}
                        onValueChange={(value) =>
                          setWizardData({
                            ...wizardData,
                            activityLevel: value as "sedentary" | "light" | "moderate" | "active" | "very-active",
                          })
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="very-active">Very Active</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Current Weight (kg)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="70"
                        value={wizardData.currentWeight || ""}
                        onChange={(e) =>
                          setWizardData({ ...wizardData, currentWeight: Number.parseFloat(e.target.value) })
                        }
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">20-300 kg</p>
                    </div>
                    <div>
                      <Label>Target Weight (kg)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="65"
                        value={wizardData.targetWeight || ""}
                        onChange={(e) =>
                          setWizardData({ ...wizardData, targetWeight: Number.parseFloat(e.target.value) })
                        }
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Weekly Change (kg/week)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="-0.5"
                      value={wizardData.planPerWeek || ""}
                      onChange={(e) => setWizardData({ ...wizardData, planPerWeek: Number.parseFloat(e.target.value) })}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Between -1.5 and +1.5 kg/week</p>
                  </div>
                </>
              )}

              {wizardData.type === "workout" && (
                <>
                  <div>
                    <Label>Workouts per Week</Label>
                    <Input
                      type="number"
                      placeholder="4"
                      value={wizardData.targetPerWeek || ""}
                      onChange={(e) => setWizardData({ ...wizardData, targetPerWeek: Number.parseInt(e.target.value) })}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Between 1-7 workouts</p>
                  </div>
                  <div>
                    <Label>Preferred Categories (Optional)</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {["Cardio", "Strength", "Mind & Body"].map((cat) => (
                        <Button
                          key={cat}
                          type="button"
                          variant={wizardData.categories?.includes(cat) ? "default" : "outline"}
                          onClick={() => {
                            const current = wizardData.categories || []
                            const updated = current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat]
                            setWizardData({ ...wizardData, categories: updated })
                          }}
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {wizardData.type === "habits" && (
                <>
                  <div>
                    <Label>Daily Steps Target</Label>
                    <Input
                      type="number"
                      placeholder="8000"
                      value={wizardData.stepsTarget || ""}
                      onChange={(e) => setWizardData({ ...wizardData, stepsTarget: Number.parseInt(e.target.value) })}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">0-50,000 steps</p>
                  </div>
                  <div>
                    <Label>Daily Water Target (ml)</Label>
                    <Input
                      type="number"
                      placeholder="2000"
                      value={wizardData.waterTargetMl || ""}
                      onChange={(e) => setWizardData({ ...wizardData, waterTargetMl: Number.parseInt(e.target.value) })}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">0-8000 ml</p>
                  </div>
                  <div>
                    <Label>Daily Sleep Target (hours)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="8"
                      value={wizardData.sleepTargetHrs || ""}
                      onChange={(e) =>
                        setWizardData({ ...wizardData, sleepTargetHrs: Number.parseFloat(e.target.value) })
                      }
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">0-16 hours</p>
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button onClick={prevWizardStep} variant="outline" className="flex-1 bg-transparent">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={nextWizardStep} className="flex-1">
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Set Dates */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-bold">Step 3: Set Timeline</h3>
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={wizardData.startDate || today}
                  onChange={(e) => setWizardData({ ...wizardData, startDate: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>End Date (Optional)</Label>
                <Input
                  type="date"
                  value={wizardData.endDate || ""}
                  onChange={(e) => setWizardData({ ...wizardData, endDate: e.target.value })}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">Leave empty for ongoing goal</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={prevWizardStep} variant="outline" className="flex-1 bg-transparent">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={nextWizardStep} className="flex-1">
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Save */}
          {wizardStep === 4 && (
            <div className="space-y-4">
              <h3 className="font-bold">Step 4: Review & Save</h3>
              <Card className="p-4 bg-muted/50">
                <h4 className="font-bold mb-2 capitalize">{wizardData.type} Goal</h4>
                <div className="text-sm space-y-1">
                  {wizardData.type === "weight" && (
                    <>
                      <p>Gender: {wizardData.gender}</p>
                      <p>Age: {wizardData.age} years</p>
                      <p>Height: {wizardData.height} cm</p>
                      <p>Activity Level: {wizardData.activityLevel}</p>
                      <p>Current: {wizardData.currentWeight}kg</p>
                      <p>Target: {wizardData.targetWeight}kg</p>
                      <p>Weekly Change: {wizardData.planPerWeek}kg/week</p>
                    </>
                  )}
                  {wizardData.type === "workout" && (
                    <>
                      <p>Target: {wizardData.targetPerWeek} workouts/week</p>
                      {wizardData.categories && wizardData.categories.length > 0 && (
                        <p>Categories: {wizardData.categories.join(", ")}</p>
                      )}
                    </>
                  )}
                  {wizardData.type === "habits" && (
                    <>
                      {wizardData.stepsTarget && <p>Steps: {wizardData.stepsTarget}/day</p>}
                      {wizardData.waterTargetMl && <p>Water: {wizardData.waterTargetMl}ml/day</p>}
                      {wizardData.sleepTargetHrs && <p>Sleep: {wizardData.sleepTargetHrs}h/day</p>}
                    </>
                  )}
                  <p className="pt-2 border-t mt-2">Start: {wizardData.startDate}</p>
                  {wizardData.endDate && <p>End: {wizardData.endDate}</p>}
                </div>
              </Card>
              <div className="flex gap-2">
                <Button onClick={prevWizardStep} variant="outline" className="flex-1 bg-transparent">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={validateAndSaveGoal} className="flex-1">
                  {editingGoalId ? "Update Goal" : "Create Goal"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingPlan} onOpenChange={() => setViewingPlan(null)}>
        {/* Increased max width so the plan modal is larger and more prominent (matches design mock) */}
  {/* Double previous size: very large max-widths (viewport will cap if smaller) and taller height */}
  <DialogContent className="max-w-[98vw] sm:!max-w-[2800px] md:!max-w-[3200px] max-h-[98vh] p-0 w-auto">
          <div className="bg-white border-b px-8 py-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-4 text-3xl">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-2xl">💪</span>
                </div>
                <span>Your Personalized Fitness Plan</span>
              </DialogTitle>
              <p className="text-base text-muted-foreground mt-3">
                Customized for your goals, age, gender, and activity level
              </p>
            </DialogHeader>
          </div>

          <div className="overflow-y-auto px-8 py-8 space-y-8" style={{ maxHeight: "calc(96vh - 140px)" }}>
            {viewingPlan && (
              <>
                {/* Current Stats */}
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">📊</span>
                    <h3 className="text-xl font-bold text-blue-700">Your Current Stats</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="p-4 bg-white rounded-lg border-l-4 border-blue-500 shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">Current Weight</p>
                      <p className="text-2xl font-bold text-blue-700">{viewingPlan.currentWeight} kg</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border-l-4 border-blue-500 shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">Height</p>
                      <p className="text-2xl font-bold text-blue-700">{viewingPlan.height} cm</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border-l-4 border-blue-500 shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">Age</p>
                      <p className="text-2xl font-bold text-blue-700">{viewingPlan.age} years</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border-l-4 border-blue-500 shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">Activity Level</p>
                      <p className="text-lg font-bold text-blue-700 capitalize">{viewingPlan.activityLevel}</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border-l-4 border-blue-500 shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">BMR</p>
                      <p className="text-lg font-bold text-blue-700">{viewingPlan.bmr} cal/day</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border-l-4 border-blue-500 shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">TDEE</p>
                      <p className="text-lg font-bold text-blue-700">{viewingPlan.tdee} cal/day</p>
                    </div>
                  </div>
                </Card>

                {/* Goal Details */}
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🎯</span>
                    <h3 className="text-xl font-bold text-purple-700">Your Goal</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="p-4 bg-white rounded-lg border-l-4 border-purple-500 shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">Goal Type</p>
                      <p className="text-lg font-bold text-purple-700">{viewingPlan.goalType}</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border-l-4 border-purple-500 shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">Target Weight</p>
                      <p className="text-2xl font-bold text-purple-700">{viewingPlan.targetWeight} kg</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border-l-4 border-purple-500 shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">Target Date</p>
                      <p className="text-lg font-bold text-purple-700">
                        {new Date(viewingPlan.targetDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border-l-4 border-purple-500 shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">Timeline</p>
                      <p className="text-2xl font-bold text-purple-700">{viewingPlan.timeline} weeks</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border-l-4 border-purple-500 shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">Weekly Target</p>
                      <p className="text-lg font-bold text-purple-700">{viewingPlan.weeklyTarget} kg/week</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border-l-4 border-purple-500 shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">Intensity</p>
                      <p className="text-lg font-bold text-purple-700 capitalize">{viewingPlan.intensity}</p>
                    </div>
                  </div>
                </Card>

                {/* Diet Plan */}
                <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🍎</span>
                    <h3 className="text-xl font-bold text-green-700">Your Diet Plan</h3>
                  </div>

                  <div className="p-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl mb-6 text-center shadow-lg">
                    <p className="text-sm font-medium mb-1">Daily Calorie Target</p>
                    <p className="text-4xl font-bold">{viewingPlan.dailyCalories} calories</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-white rounded-xl border-2 border-blue-300 shadow-sm">
                      <p className="text-sm text-blue-600 font-semibold mb-1">Protein</p>
                      <p className="text-3xl font-bold text-blue-700">{viewingPlan.protein}g</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border-2 border-orange-300 shadow-sm">
                      <p className="text-sm text-orange-600 font-semibold mb-1">Carbs</p>
                      <p className="text-3xl font-bold text-orange-700">{viewingPlan.carbs}g</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border-2 border-yellow-300 shadow-sm">
                      <p className="text-sm text-yellow-600 font-semibold mb-1">Fat</p>
                      <p className="text-3xl font-bold text-yellow-700">{viewingPlan.fat}g</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🍏</span>
                      <h4 className="font-bold text-green-700 text-lg">Recommended Daily Food Plan</h4>
                    </div>

                    {viewingPlan.meals.map((meal, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-xl border-l-4 border-green-500 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-bold text-blue-700 text-lg flex items-center gap-2">
                            <span className="text-2xl">{["🥐", "🍱", "🍽️", "🍎"][idx]}</span>
                            {meal.name}
                          </h5>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                            {meal.calories} cal
                          </span>
                        </div>
                        <div className="space-y-2">
                          {meal.foods.map((food, foodIdx) => (
                            <div
                              key={foodIdx}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div>
                                <p className="font-medium text-gray-800">{food.name}</p>
                                <p className="text-sm text-gray-500">{food.portion}</p>
                              </div>
                              <span className="text-sm text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full">
                                {food.calories} cal
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Workout Plan */}
                <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">💪</span>
                    <h3 className="text-xl font-bold text-orange-700">Your Workout Plan</h3>
                  </div>

                  <div className="space-y-3">
                    {viewingPlan.workoutPlan.map((day) => (
                      <div
                        key={day.day}
                        className="p-4 bg-white rounded-xl border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-lg">
                            {day.day}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Day {day.day}</p>
                            <p className="font-bold text-lg text-gray-800">{day.workout}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Progress Tracking */}
                <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">📈</span>
                    <h3 className="text-xl font-bold text-cyan-700">Progress Tracking</h3>
                  </div>

                  <div className="space-y-3">
                    {viewingPlan.progressTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-white rounded-lg border-l-4 border-cyan-500 shadow-sm flex items-start gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-gray-700">{tip}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="flex gap-4 pt-4 pb-2">
                  <Button onClick={() => setViewingPlan(null)} variant="outline" className="flex-1 h-14 text-lg">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back
                  </Button>
                  <Button
                    onClick={() => {
                      alert("Plan saved! You can track your progress from the dashboard.")
                      setViewingPlan(null)
                    }}
                    className="flex-1 h-14 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold"
                  >
                    Save Plan
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={checkinOpen} onOpenChange={setCheckinOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Daily Check-in</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {activeGoals.find((g) => g.type === "weight") && (
              <div>
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="70.5"
                  value={checkinData.weight || ""}
                  onChange={(e) => setCheckinData({ ...checkinData, weight: Number.parseFloat(e.target.value) })}
                  className="mt-2"
                />
              </div>
            )}
            {activeGoals.find((g) => g.type === "workout") && (
              <div>
                <Label>Workouts Completed Today</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={checkinData.workouts || ""}
                  onChange={(e) => setCheckinData({ ...checkinData, workouts: Number.parseInt(e.target.value) })}
                  className="mt-2"
                />
              </div>
            )}
            {activeGoals.find((g) => g.type === "habits") && (
              <>
                {activeGoals.find((g) => g.type === "habits")?.stepsTarget !== undefined &&
                  activeGoals.find((g) => g.type === "habits")?.stepsTarget! > 0 && (
                    <div>
                      <Label>Steps Today</Label>
                      <Input
                        type="number"
                        placeholder="8000"
                        value={checkinData.steps || ""}
                        onChange={(e) => setCheckinData({ ...checkinData, steps: Number.parseInt(e.target.value) })}
                        className="mt-2"
                      />
                    </div>
                  )}
                {activeGoals.find((g) => g.type === "habits")?.waterTargetMl !== undefined &&
                  activeGoals.find((g) => g.type === "habits")?.waterTargetMl! > 0 && (
                    <div>
                      <Label>Water (ml) Today</Label>
                      <Input
                        type="number"
                        placeholder="2000"
                        value={checkinData.waterMl || ""}
                        onChange={(e) => setCheckinData({ ...checkinData, waterMl: Number.parseInt(e.target.value) })}
                        className="mt-2"
                      />
                    </div>
                  )}
                {activeGoals.find((g) => g.type === "habits")?.sleepTargetHrs !== undefined &&
                  activeGoals.find((g) => g.type === "habits")?.sleepTargetHrs! > 0 && (
                    <div>
                      <Label>Sleep (hours) Last Night</Label>
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="8"
                        value={checkinData.sleepHrs || ""}
                        onChange={(e) =>
                          setCheckinData({ ...checkinData, sleepHrs: Number.parseFloat(e.target.value) })
                        }
                        className="mt-2"
                      />
                    </div>
                  )}
              </>
            )}
            <Button onClick={saveCheckin} className="w-full">
              Save Check-in
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={celebrationOpen} onOpenChange={setCelebrationOpen}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 mb-4">
              Yahoo! Goal Achieved Successfully! 🎉
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Congratulations on reaching your {celebrationGoal?.type} goal! Your dedication and hard work have paid
              off!
            </p>
            <div className="space-y-2 text-left bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl mb-6">
              <p className="text-sm text-gray-600">
                <strong>Started:</strong>{" "}
                {celebrationGoal?.startDate ? new Date(celebrationGoal.startDate).toLocaleDateString() : "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Completed:</strong> {today ? new Date(today).toLocaleDateString() : "N/A"}
              </p>
              {celebrationGoal?.type === "weight" && (
                <>
                  <p className="text-sm text-gray-600">
                    <strong>Target Weight:</strong> {celebrationGoal.targetWeight} kg
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Achievement:</strong> You've successfully reached your target weight!
                  </p>
                </>
              )}
            </div>
            <Button
              onClick={() => setCelebrationOpen(false)}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold text-lg h-12"
            >
              Awesome! 🎊
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
