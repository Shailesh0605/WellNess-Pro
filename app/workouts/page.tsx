"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { apiFetch } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Check, Dumbbell, Home } from "lucide-react"
import { useRouter } from "next/navigation"

type Category = "cardio" | "strength" | "mind-body" | null
type Step = "category" | "exercise" | "workout-type" | "specific-exercises" | "inputs"
type WorkoutType = "gym" | "home" | null
type StrengthSubsection = "chest" | "back" | "shoulders" | "arms" | "abs" | "crossfit" | "legs" | null

interface Exercise {
  id: string
  name: string
  image: string
  hasBuiltInText?: boolean
}

interface ExerciseDetail {
  id: string
  name: string
  sets: string
  reps: string
  weight: string
}

const cardioExercises: Exercise[] = [
  { id: "running", name: "Running", image: "/person-running-outdoors.png" },
  { id: "cycling", name: "Cycling", image: "/person-cycling-on-bike.jpg" },
  {
    id: "swimming",
    name: "Swimming",
    image: "/swimming-pool-with-swimmer.jpg",
    hasBuiltInText: true,
  },
  {
    id: "treadmill",
    name: "Treadmill",
    image: "/person-on-treadmill.png",
  },
  { id: "skipping", name: "Skipping", image: "/person-jumping-rope.jpg" },
  {
    id: "elliptical",
    name: "Elliptical",
    image: "/elliptical-machine-in-gym.jpg",
  },
]

const strengthExercises: Exercise[] = [
  { id: "chest", name: "Chest", image: "/chest-workout-bench-press.jpg" },
  { id: "back", name: "Back", image: "/back-workout-pull-ups.jpg" },
  {
    id: "shoulders",
    name: "Shoulders",
    image: "/shoulder-workout-dumbbells.jpg",
  },
  { id: "legs", name: "Legs", image: "/leg-workout-squats.jpg" },
  { id: "arms", name: "Arms", image: "/arm-workout-bicep-curls.jpg" },
  { id: "abs", name: "Abs", image: "/abs-workout-core-exercises.jpg" },
  { id: "crossfit", name: "CrossFit", image: "/crossfit-workout.jpg" },
]

const mindBodyExercises: Exercise[] = [
  { id: "yoga", name: "Yoga", image: "/yoga-meditation-pose.jpg" },
  {
    id: "meditation",
    name: "Meditation",
    image: "/meditation-peaceful-setting.jpg",
  },
]

const strengthExerciseDatabase = {
  chest: {
    gym: [
      { id: "barbell-bench", name: "Barbell Bench Press", defaultSets: "4", defaultReps: "8" },
      { id: "incline-db", name: "Incline Dumbbell Press", defaultSets: "3", defaultReps: "10" },
      { id: "decline-bench", name: "Decline Bench Press", defaultSets: "3", defaultReps: "10" },
      { id: "cable-cross", name: "Cable Crossover", defaultSets: "3", defaultReps: "12" },
      { id: "db-fly", name: "Dumbbell Fly", defaultSets: "3", defaultReps: "12" },
    ],
    home: [
      { id: "regular-pushup", name: "Regular Push-ups", defaultSets: "3", defaultReps: "15" },
      { id: "incline-pushup", name: "Incline Push-ups", defaultSets: "3", defaultReps: "12" },
      { id: "decline-pushup", name: "Decline Push-ups", defaultSets: "3", defaultReps: "10" },
      { id: "wide-pushup", name: "Wide Push-ups", defaultSets: "3", defaultReps: "12" },
      { id: "diamond-pushup", name: "Diamond Push-ups", defaultSets: "3", defaultReps: "10" },
    ],
  },
  back: {
    gym: [
      { id: "pullups", name: "Pull-Ups / Lat Pulldown", defaultSets: "4", defaultReps: "8" },
      { id: "cable-rows", name: "Seated Cable Rows", defaultSets: "3", defaultReps: "10" },
      { id: "deadlift", name: "Barbell Deadlift", defaultSets: "4", defaultReps: "6" },
      { id: "db-row", name: "One-Arm Dumbbell Row", defaultSets: "3", defaultReps: "10" },
      { id: "tbar-row", name: "T-Bar Row", defaultSets: "3", defaultReps: "10" },
    ],
    home: [
      { id: "inverted-rows", name: "Inverted Rows (under table)", defaultSets: "3", defaultReps: "10" },
      { id: "superman", name: "Superman Hold", defaultSets: "3", defaultReps: "20 sec" },
      { id: "snow-angels", name: "Reverse Snow Angels", defaultSets: "3", defaultReps: "15" },
      { id: "backpack-rows", name: "Backpack Rows", defaultSets: "3", defaultReps: "12" },
      { id: "towel-pulls", name: "Towel Lat Pulls", defaultSets: "3", defaultReps: "15" },
    ],
  },
  shoulders: {
    gym: [
      { id: "overhead-press", name: "Overhead Barbell Press", defaultSets: "4", defaultReps: "8" },
      { id: "lateral-raise", name: "Dumbbell Lateral Raise", defaultSets: "3", defaultReps: "12" },
      { id: "front-raise", name: "Front Raise", defaultSets: "3", defaultReps: "12" },
      { id: "rear-delt", name: "Rear Delt Fly", defaultSets: "3", defaultReps: "12" },
      { id: "arnold-press", name: "Arnold Press", defaultSets: "3", defaultReps: "10" },
    ],
    home: [
      { id: "pike-pushup", name: "Pike Push-ups", defaultSets: "3", defaultReps: "10" },
      { id: "wall-walks", name: "Wall Walks", defaultSets: "3", defaultReps: "5" },
      { id: "shoulder-taps", name: "Shoulder Taps (Plank)", defaultSets: "3", defaultReps: "20" },
      { id: "backpack-raises", name: "Backpack Front Raises", defaultSets: "3", defaultReps: "12" },
      { id: "arm-circles", name: "Arm Circles", defaultSets: "3", defaultReps: "40 sec" },
    ],
  },
  arms: {
    gym: [
      { id: "barbell-curl", name: "Barbell Curl", defaultSets: "4", defaultReps: "10" },
      { id: "hammer-curl", name: "Dumbbell Hammer Curl", defaultSets: "3", defaultReps: "12" },
      { id: "preacher-curl", name: "Preacher Curl", defaultSets: "3", defaultReps: "10" },
      { id: "tricep-dips", name: "Tricep Dips", defaultSets: "3", defaultReps: "10" },
      { id: "rope-pushdown", name: "Rope Pushdown", defaultSets: "3", defaultReps: "12" },
      { id: "skull-crushers", name: "Skull Crushers", defaultSets: "3", defaultReps: "10" },
    ],
    home: [
      { id: "towel-curls", name: "Towel Curls (resistance)", defaultSets: "3", defaultReps: "12" },
      { id: "backpack-curl", name: "Backpack Curl", defaultSets: "3", defaultReps: "15" },
      { id: "iso-flex", name: "Isometric Flex Hold", defaultSets: "3", defaultReps: "20 sec" },
      { id: "diamond-pushup-tri", name: "Diamond Push-ups", defaultSets: "3", defaultReps: "10" },
      { id: "bench-dips", name: "Bench Dips", defaultSets: "3", defaultReps: "12" },
      { id: "close-pushup", name: "Close-Grip Push-ups", defaultSets: "3", defaultReps: "10" },
    ],
  },
  abs: {
    gym: [
      { id: "hanging-leg", name: "Hanging Leg Raises", defaultSets: "3", defaultReps: "12" },
      { id: "cable-crunch", name: "Cable Crunches", defaultSets: "3", defaultReps: "15" },
      { id: "ab-wheel", name: "Ab Wheel Rollout", defaultSets: "3", defaultReps: "10" },
      { id: "russian-twist", name: "Russian Twists", defaultSets: "3", defaultReps: "20" },
      { id: "plank-gym", name: "Plank", defaultSets: "3", defaultReps: "60 sec" },
    ],
    home: [
      { id: "crunches", name: "Crunches", defaultSets: "3", defaultReps: "15" },
      { id: "leg-raises", name: "Leg Raises", defaultSets: "3", defaultReps: "12" },
      { id: "bicycle-crunch", name: "Bicycle Crunches", defaultSets: "3", defaultReps: "20" },
      { id: "flutter-kicks", name: "Flutter Kicks", defaultSets: "3", defaultReps: "30 sec" },
      { id: "plank-home", name: "Plank", defaultSets: "3", defaultReps: "60 sec" },
    ],
  },
  crossfit: {
    gym: [
      { id: "burpees-gym", name: "Burpees", defaultSets: "3", defaultReps: "15" },
      { id: "kettlebell", name: "Kettlebell Swings", defaultSets: "3", defaultReps: "20" },
      { id: "box-jumps", name: "Box Jumps", defaultSets: "3", defaultReps: "15" },
      { id: "battle-ropes", name: "Battle Ropes", defaultSets: "3", defaultReps: "30 sec" },
      { id: "tire-flips", name: "Tire Flips / Sled Push", defaultSets: "3", defaultReps: "10" },
    ],
    home: [
      { id: "jump-squats", name: "Jump Squats", defaultSets: "3", defaultReps: "15" },
      { id: "mountain-climbers", name: "Mountain Climbers", defaultSets: "3", defaultReps: "30 sec" },
      { id: "burpees-home", name: "Burpees", defaultSets: "3", defaultReps: "10" },
      { id: "jumping-lunges", name: "Jumping Lunges", defaultSets: "3", defaultReps: "15" },
      { id: "plank-pushup", name: "Plank to Push-up", defaultSets: "3", defaultReps: "12" },
    ],
  },
  legs: {
    gym: [
      { id: "barbell-squat", name: "Barbell Squat", defaultSets: "4", defaultReps: "8" },
      { id: "leg-press", name: "Leg Press", defaultSets: "3", defaultReps: "10" },
      { id: "romanian-dl", name: "Romanian Deadlift", defaultSets: "3", defaultReps: "10" },
      { id: "walking-lunges", name: "Walking Lunges", defaultSets: "3", defaultReps: "12" },
      { id: "leg-extension", name: "Leg Extension", defaultSets: "3", defaultReps: "12" },
      { id: "calf-raise-gym", name: "Standing Calf Raise", defaultSets: "3", defaultReps: "15" },
    ],
    home: [
      { id: "bodyweight-squat", name: "Bodyweight Squats", defaultSets: "3", defaultReps: "15" },
      { id: "jump-squats-legs", name: "Jump Squats", defaultSets: "3", defaultReps: "12" },
      { id: "forward-lunges", name: "Forward Lunges", defaultSets: "3", defaultReps: "10" },
      { id: "wall-sit", name: "Wall Sit", defaultSets: "3", defaultReps: "30 sec" },
      { id: "glute-bridge", name: "Glute Bridge", defaultSets: "3", defaultReps: "15" },
      { id: "calf-raise-home", name: "Calf Raises (on stairs)", defaultSets: "3", defaultReps: "20" },
    ],
  },
}

export default function WorkoutsPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("category")
  const [category, setCategory] = useState<Category>(null)
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [strengthSubsection, setStrengthSubsection] = useState<StrengthSubsection>(null)
  const [workoutType, setWorkoutType] = useState<WorkoutType>(null)
  const [specificExercises, setSpecificExercises] = useState<string[]>([])
  const [exerciseDetails, setExerciseDetails] = useState<ExerciseDetail[]>([])
  const [otherExercise, setOtherExercise] = useState("")
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [duration, setDuration] = useState("")
  const [calories, setCalories] = useState("")
  const [sets, setSets] = useState("")
  const [reps, setReps] = useState("")
  const [intensity, setIntensity] = useState("")

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat)
    setStep("exercise")
    setSelectedExercises([])
  }

  const handleExerciseToggle = (exerciseId: string) => {
    if (category === "strength") {
      setStrengthSubsection(exerciseId as StrengthSubsection)
      setStep("workout-type")
    } else {
      setSelectedExercises((prev) =>
        prev.includes(exerciseId) ? prev.filter((id) => id !== exerciseId) : [...prev, exerciseId],
      )
    }
  }

  const handleWorkoutTypeSelect = (type: WorkoutType) => {
    setWorkoutType(type)
    setStep("specific-exercises")
    setSpecificExercises([])
    setExerciseDetails([])
  }

  const handleSpecificExerciseToggle = (exerciseId: string) => {
    setSpecificExercises((prev) => {
      const newSelection = prev.includes(exerciseId) ? prev.filter((id) => id !== exerciseId) : [...prev, exerciseId]

      if (!prev.includes(exerciseId)) {
        const exerciseList = strengthExerciseDatabase[strengthSubsection!][workoutType!]
        const exercise = exerciseList.find((ex) => ex.id === exerciseId)
        if (exercise) {
          setExerciseDetails((prevDetails) => [
            ...prevDetails,
            {
              id: exerciseId,
              name: exercise.name,
              sets: exercise.defaultSets,
              reps: exercise.defaultReps,
              weight: "",
            },
          ])
        }
      } else {
        setExerciseDetails((prevDetails) => prevDetails.filter((detail) => detail.id !== exerciseId))
      }

      return newSelection
    })
  }

  const handleAddOtherExercise = () => {
    if (otherExercise.trim()) {
      const customId = `custom-${Date.now()}`
      setSpecificExercises((prev) => [...prev, customId])
      setExerciseDetails((prev) => [
        ...prev,
        {
          id: customId,
          name: otherExercise,
          sets: "3",
          reps: "10",
          weight: "",
        },
      ])
      setOtherExercise("")
      setShowOtherInput(false)
    }
  }

  const handleExerciseDetailChange = (exerciseId: string, field: "sets" | "reps" | "weight", value: string) => {
    setExerciseDetails((prev) =>
      prev.map((detail) => (detail.id === exerciseId ? { ...detail, [field]: value } : detail)),
    )
  }

  const handleNext = () => {
    if (category === "strength" && step === "specific-exercises") {
      if (specificExercises.length > 0) {
        setStep("inputs")
      }
    } else if (selectedExercises.length > 0) {
      setStep("inputs")
    }
  }

  const handleBack = () => {
    if (step === "inputs") {
      if (category === "strength") {
        setStep("specific-exercises")
      } else {
        setStep("exercise")
      }
    } else if (step === "specific-exercises") {
      setStep("workout-type")
      setSpecificExercises([])
      setExerciseDetails([])
    } else if (step === "workout-type") {
      setStep("exercise")
      setWorkoutType(null)
    } else if (step === "exercise") {
      setStep("category")
      setCategory(null)
      setSelectedExercises([])
      setStrengthSubsection(null)
    }
  }

  const handleLogWorkout = async () => {
    const workout: any = {
      category,
      exercises: category === "strength" ? specificExercises : selectedExercises,
      strengthSubsection: category === "strength" ? strengthSubsection : undefined,
      workoutType: category === "strength" ? workoutType : undefined,
      exerciseDetails: category === "strength" ? exerciseDetails : undefined,
      duration,
      calories: category === "cardio" ? calories : undefined,
      sets: category === "strength" && !exerciseDetails.length ? sets : undefined,
      reps: category === "strength" && !exerciseDetails.length ? reps : undefined,
      intensity,
      timestamp: new Date().toISOString(),
    }

    // Try to persist to backend for authenticated users. If that succeeds,
    // attach the returned id to the workout so future deletes call the API.
    try {
      const res = await apiFetch('/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: workout, timestamp: workout.timestamp }),
      })

      if (res && res.ok) {
        try {
          const created = await res.json()
          if (created && created.id) {
            workout.id = created.id
          }
        } catch (e) {
          // ignore parse errors
        }
      }
    } catch (e) {
      // network/unauthenticated: fallback to localStorage below
    }

    const workouts = JSON.parse(localStorage.getItem("workouts") || "[]")
    workouts.push(workout)
    localStorage.setItem("workouts", JSON.stringify(workouts))

    setStep("category")
    setCategory(null)
    setSelectedExercises([])
    setStrengthSubsection(null)
    setWorkoutType(null)
    setSpecificExercises([])
    setExerciseDetails([])
    setDuration("")
    setCalories("")
    setSets("")
    setReps("")
    setIntensity("")

    alert("Workout logged successfully!")
    router.push("/progress")
  }

  const getExercises = () => {
    if (category === "cardio") return cardioExercises
    if (category === "strength") return strengthExercises
    if (category === "mind-body") return mindBodyExercises
    return []
  }

  const getSpecificExercises = () => {
    if (strengthSubsection && workoutType) {
      return strengthExerciseDatabase[strengthSubsection][workoutType]
    }
    return []
  }

  return (
    <div className="flex min-h-screen bg-green-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <img
                src="/fitness-motivation-icon.jpg"
                alt="Motivation"
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h1 className="text-4xl font-bold text-foreground">Log Your Workout</h1>
                <p className="text-lg text-muted-foreground mt-1">
                  "The only bad workout is the one that didn't happen."
                </p>
              </div>
            </div>
          </div>

          {step !== "category" && (
            <Button variant="outline" onClick={handleBack} className="mb-6 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          {step === "category" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Select Category</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card
                  className="relative aspect-[4/3] overflow-hidden cursor-pointer hover-3d group"
                  onClick={() => handleCategorySelect("cardio")}
                >
                  <img
                    src="/cardio-running-fitness.jpg"
                    alt="Cardio"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <h3 className="text-2xl font-bold text-white">Cardio</h3>
                  </div>
                </Card>

                <Card
                  className="relative aspect-[4/3] overflow-hidden cursor-pointer hover-3d group"
                  onClick={() => handleCategorySelect("strength")}
                >
                  <img
                    src="/strength-training-weights.jpg"
                    alt="Strength"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <h3 className="text-2xl font-bold text-white">Strength</h3>
                  </div>
                </Card>

                <Card
                  className="relative aspect-[4/3] overflow-hidden cursor-pointer hover-3d group"
                  onClick={() => handleCategorySelect("mind-body")}
                >
                  <img
                    src="/yoga-meditation-peaceful-mind-body-wellness.jpg"
                    alt="Mind & Body"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <h3 className="text-2xl font-bold text-white">Mind & Body</h3>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {step === "exercise" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground capitalize">
                Select {category?.replace("-", " & ")} {category === "strength" ? "Muscle Group" : "Exercises"}
              </h2>
              <p className="text-muted-foreground">
                {category === "strength" ? "Choose a muscle group to train" : "You can select multiple exercises"}
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                {getExercises().map((exercise) => (
                  <Card
                    key={exercise.id}
                    className={`relative aspect-[4/3] overflow-hidden cursor-pointer hover-3d group ${
                      category !== "strength" && selectedExercises.includes(exercise.id) ? "ring-4 ring-primary" : ""
                    }`}
                    onClick={() => handleExerciseToggle(exercise.id)}
                  >
                    <img
                      src={exercise.image || "/placeholder.svg?height=300&width=400"}
                      alt={exercise.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                      <h3 className="text-xl font-bold text-white">{exercise.name}</h3>
                    </div>
                    {category !== "strength" && selectedExercises.includes(exercise.id) && (
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-5 h-5 text-primary-foreground" />
                      </div>
                    )}
                  </Card>
                ))}
              </div>
              {category !== "strength" && selectedExercises.length > 0 && (
                <Button onClick={handleNext} size="lg" className="w-full md:w-auto">
                  Next: Enter Details
                </Button>
              )}
            </div>
          )}

          {step === "workout-type" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground capitalize">
                Choose Workout Location for {strengthSubsection}
              </h2>
              <p className="text-muted-foreground">Select whether you're working out at the gym or at home</p>
              <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <Card
                  className="relative h-64 overflow-hidden cursor-pointer hover-3d group bg-gradient-to-br from-orange-500 to-red-500"
                  onClick={() => handleWorkoutTypeSelect("gym")}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
                    <Dumbbell className="w-20 h-20 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-3xl font-bold">Gym Workout</h3>
                    <p className="text-sm mt-2 opacity-90">Equipment-based exercises</p>
                  </div>
                </Card>

                <Card
                  className="relative h-64 overflow-hidden cursor-pointer hover-3d group bg-gradient-to-br from-green-500 to-teal-500"
                  onClick={() => handleWorkoutTypeSelect("home")}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
                    <Home className="w-20 h-20 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-3xl font-bold">Home Workout</h3>
                    <p className="text-sm mt-2 opacity-90">Bodyweight & minimal equipment</p>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {step === "specific-exercises" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground capitalize">
                Select {strengthSubsection} Exercises ({workoutType})
              </h2>
              <p className="text-muted-foreground">Choose exercises for your workout</p>

              <div className="grid md:grid-cols-2 gap-4">
                {getSpecificExercises().map((exercise) => (
                  <Card
                    key={exercise.id}
                    className={`p-4 cursor-pointer hover-3d transition-all ${
                      specificExercises.includes(exercise.id) ? "ring-4 ring-primary bg-primary/5" : "hover:bg-accent"
                    }`}
                    onClick={() => handleSpecificExerciseToggle(exercise.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{exercise.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {exercise.defaultSets} × {exercise.defaultReps}
                        </p>
                      </div>
                      {specificExercises.includes(exercise.id) && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-5 h-5 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-4">
                {!showOtherInput ? (
                  <Button variant="outline" onClick={() => setShowOtherInput(true)} className="w-full">
                    + Add Other Exercise
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Label htmlFor="other-exercise">Custom Exercise Name</Label>
                    <div className="flex gap-2">
                      <Input
                        id="other-exercise"
                        placeholder="Enter exercise name"
                        value={otherExercise}
                        onChange={(e) => setOtherExercise(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddOtherExercise()}
                      />
                      <Button onClick={handleAddOtherExercise}>Add</Button>
                      <Button variant="outline" onClick={() => setShowOtherInput(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              {specificExercises.length > 0 && (
                <Button onClick={handleNext} size="lg" className="w-full md:w-auto">
                  Next: Enter Details
                </Button>
              )}
            </div>
          )}

          {step === "inputs" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Workout Details</h2>

              {category === "strength" && exerciseDetails.length > 0 && (
                <Card className="p-6 space-y-6">
                  <h3 className="text-xl font-semibold">Exercise Details</h3>
                  {exerciseDetails.map((exercise) => (
                    <div key={exercise.id} className="p-4 border rounded-lg space-y-4">
                      <h4 className="font-semibold text-lg">{exercise.name}</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`sets-${exercise.id}`}>Sets</Label>
                          <Input
                            id={`sets-${exercise.id}`}
                            type="text"
                            placeholder="e.g., 3"
                            value={exercise.sets}
                            onChange={(e) => handleExerciseDetailChange(exercise.id, "sets", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`reps-${exercise.id}`}>Reps</Label>
                          <Input
                            id={`reps-${exercise.id}`}
                            type="text"
                            placeholder="e.g., 12"
                            value={exercise.reps}
                            onChange={(e) => handleExerciseDetailChange(exercise.id, "reps", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`weight-${exercise.id}`}>Weight (kg)</Label>
                          <Input
                            id={`weight-${exercise.id}`}
                            type="text"
                            placeholder="e.g., 50"
                            value={exercise.weight}
                            onChange={(e) => handleExerciseDetailChange(exercise.id, "weight", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </Card>
              )}

              <Card className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="e.g., 30"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>

                {category === "cardio" && (
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories Burned</Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="e.g., 250"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="intensity">Intensity (1-10)</Label>
                  <Input
                    id="intensity"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="e.g., 7"
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value)}
                  />
                </div>

                <Button onClick={handleLogWorkout} size="lg" className="w-full">
                  Log Workout
                </Button>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
