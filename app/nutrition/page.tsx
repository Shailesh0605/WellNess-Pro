"use client"

import { useEffect, useState, useRef } from "react"
import { apiFetch } from "@/lib/auth"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Salad, BarChart3, Trash2, Coffee, Soup, UtensilsCrossed, Apple, X } from "lucide-react"

const INDIAN_FOODS = [
  // Breakfast - Healthy Options
  { name: "Oatmeal", calories: 150, protein: 5, carbs: 27, fat: 3, type: "Breakfast", emoji: "🥣" },
  { name: "Poha", calories: 250, protein: 6, carbs: 45, fat: 5, type: "Breakfast", emoji: "🍚" },
  { name: "Upma", calories: 200, protein: 5, carbs: 35, fat: 4, type: "Breakfast", emoji: "🥣" },
  { name: "Idli (2 pcs)", calories: 150, protein: 4, carbs: 30, fat: 1, type: "Breakfast", emoji: "⚪" },
  { name: "Dosa", calories: 180, protein: 5, carbs: 32, fat: 3, type: "Breakfast", emoji: "🥞" },
  { name: "Boiled Eggs (2)", calories: 140, protein: 12, carbs: 1, fat: 10, type: "Breakfast", emoji: "🥚" },
  { name: "Egg White Omelette", calories: 100, protein: 18, carbs: 2, fat: 2, type: "Breakfast", emoji: "🍳" },
  { name: "Greek Yogurt", calories: 120, protein: 15, carbs: 8, fat: 4, type: "Breakfast", emoji: "🥛" },
  { name: "Sprouts Salad", calories: 100, protein: 7, carbs: 15, fat: 1, type: "Breakfast", emoji: "🌱" },

  // Lunch/Dinner - Protein Rich
  { name: "Grilled Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 4, type: "Lunch", emoji: "🍗" },
  { name: "Fish Curry", calories: 200, protein: 25, carbs: 5, fat: 8, type: "Lunch", emoji: "🐟" },
  { name: "Paneer Tikka", calories: 220, protein: 18, carbs: 8, fat: 14, type: "Lunch", emoji: "🧈" },
  { name: "Dal Rice", calories: 350, protein: 12, carbs: 65, fat: 5, type: "Lunch", emoji: "🍛" },
  { name: "Moong Dal", calories: 180, protein: 12, carbs: 30, fat: 2, type: "Lunch", emoji: "🫘" },
  { name: "Rajma Chawal", calories: 400, protein: 15, carbs: 70, fat: 6, type: "Lunch", emoji: "🍚" },
  { name: "Brown Rice (1 cup)", calories: 215, protein: 5, carbs: 45, fat: 2, type: "Lunch", emoji: "🍚" },
  { name: "Quinoa Bowl", calories: 220, protein: 8, carbs: 39, fat: 4, type: "Lunch", emoji: "🥗" },
  { name: "Roti (2 pcs)", calories: 150, protein: 5, carbs: 30, fat: 2, type: "Lunch", emoji: "🫓" },
  { name: "Khichdi", calories: 250, protein: 8, carbs: 45, fat: 4, type: "Lunch", emoji: "🍲" },
  { name: "Sabzi Roti", calories: 300, protein: 8, carbs: 50, fat: 8, type: "Dinner", emoji: "🥗" },
  { name: "Grilled Fish", calories: 180, protein: 28, carbs: 0, fat: 6, type: "Dinner", emoji: "🐟" },
  { name: "Tofu Curry", calories: 150, protein: 12, carbs: 8, fat: 8, type: "Dinner", emoji: "🥘" },

  // Vegetables & Salads
  { name: "Mixed Vegetable Salad", calories: 80, protein: 3, carbs: 15, fat: 1, type: "Lunch", emoji: "🥗" },
  { name: "Cucumber Salad", calories: 45, protein: 2, carbs: 8, fat: 0, type: "Snack", emoji: "🥒" },
  { name: "Palak Paneer", calories: 250, protein: 14, carbs: 12, fat: 16, type: "Lunch", emoji: "🥬" },
  { name: "Mixed Vegetables", calories: 100, protein: 4, carbs: 18, fat: 2, type: "Lunch", emoji: "🥦" },

  // Snacks - Healthy Options
  { name: "Banana", calories: 105, protein: 1, carbs: 27, fat: 0, type: "Snack", emoji: "🍌" },
  { name: "Apple", calories: 95, protein: 0, carbs: 25, fat: 0, type: "Snack", emoji: "🍎" },
  { name: "Almonds (10 pcs)", calories: 70, protein: 3, carbs: 3, fat: 6, type: "Snack", emoji: "🌰" },
  { name: "Walnuts (5 pcs)", calories: 65, protein: 2, carbs: 2, fat: 6, type: "Snack", emoji: "🥜" },
  { name: "Protein Shake", calories: 150, protein: 25, carbs: 8, fat: 3, type: "Snack", emoji: "🥤" },
  { name: "Roasted Chana", calories: 120, protein: 6, carbs: 20, fat: 2, type: "Snack", emoji: "🫘" },
  { name: "Fruit Salad", calories: 110, protein: 2, carbs: 26, fat: 0, type: "Snack", emoji: "🍇" },
  { name: "Green Tea", calories: 2, protein: 0, carbs: 0, fat: 0, type: "Snack", emoji: "🍵" },
  { name: "Buttermilk", calories: 40, protein: 2, carbs: 5, fat: 1, type: "Snack", emoji: "🥛" },
]

interface Meal {
  id: string
  type: string
  food: string
  calories: number
  protein: number
  carbs: number
  fat: number
  quantity?: number
  timestamp: string
  emoji?: string
}

type NewMeal = Omit<Meal, 'id'> & { id?: string }

interface ServerLog {
  id: number
  data: Partial<NewMeal>
  timestamp: string
}

interface BMIResult {
  bmi: number
  category: string
  color: string
}

export default function NutritionPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [mealType, setMealType] = useState("")
  const [foodItem, setFoodItem] = useState("")
  const [calories, setCalories] = useState("")
  const [protein, setProtein] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fat, setFat] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [bmiResult, setBmiResult] = useState<BMIResult | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredFoods, setFilteredFoods] = useState<Array<{ name: string; calories: number; protein: number; carbs: number; fat: number; type: string; emoji?: string }>>(INDIAN_FOODS)
  const [customFoods, setCustomFoods] = useState<Array<{ name: string; calories: number; protein: number; carbs: number; fat: number; type: string; emoji?: string; id?: number }>>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newFoodName, setNewFoodName] = useState("")
  const [newFoodCalories, setNewFoodCalories] = useState("")
  const [newFoodProtein, setNewFoodProtein] = useState("")
  const [newFoodCarbs, setNewFoodCarbs] = useState("")
  const [newFoodFat, setNewFoodFat] = useState("")
  const [newFoodEmoji, setNewFoodEmoji] = useState("")
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // base nutrition values from selected food (per 1 serving)
  const [baseCalories, setBaseCalories] = useState<number | null>(null)
  const [baseProtein, setBaseProtein] = useState<number | null>(null)
  const [baseCarbs, setBaseCarbs] = useState<number | null>(null)
  const [baseFat, setBaseFat] = useState<number | null>(null)
  // flags to allow manual override; when true, auto-scaling won't overwrite that field
  const [caloriesEdited, setCaloriesEdited] = useState(false)
  const [proteinEdited, setProteinEdited] = useState(false)
  const [carbsEdited, setCarbsEdited] = useState(false)
  const [fatEdited, setFatEdited] = useState(false)

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    ;(async () => {
      // try backend first (requires auth)
      try {
        const res = await apiFetch('/nutrition')
        if (res.ok) {
          const logs = await res.json()
          // logs: [{ id, data, timestamp, ... }]
          const parsed: Meal[] = logs.map((l: any) => ({ id: String(l.id), ...(l.data || {}), timestamp: l.timestamp }))
          const todayMeals = parsed.filter((m) => m.timestamp.startsWith(today))
          setMeals(todayMeals)
          return
        }
      } catch (e) {
        // ignore and fallback to localStorage
      }

      const stored = localStorage.getItem("nutritionMeals")
      if (stored) {
        const allMeals = JSON.parse(stored)
        const todayMeals = allMeals.filter((m: Meal) => m.timestamp.startsWith(today))
        setMeals(todayMeals)
      }
    })()
  }, [today])

  useEffect(() => {
    // merge built-in + custom foods and filter by meal type
    const allFoods = [...INDIAN_FOODS, ...customFoods]
    if (mealType) {
      const filtered = allFoods.filter((food) => food.type === mealType)
      setFilteredFoods(filtered)
    } else {
      setFilteredFoods(allFoods)
    }
  }, [mealType])

  // load custom foods from localStorage on mount
  useEffect(() => {
    ;(async () => {
      // try to load server-side custom foods for authenticated users
      try {
        const res = await apiFetch('/custom-foods')
        if (res && res.ok) {
          const serverFoods = await res.json()
          if (Array.isArray(serverFoods)) {
            setCustomFoods(serverFoods.map((f: any) => ({ name: f.name, calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat, type: f.type, emoji: f.emoji, id: f.id })))
            return
          }
        }
      } catch (e) {
        // ignore and fall back to localStorage
      }

      try {
        const stored = localStorage.getItem('customFoods')
        if (stored) setCustomFoods(JSON.parse(stored))
      } catch (e) {
        // ignore
      }
    })()
  }, [])

  // Auto-scale nutrition fields when quantity or selected base changes, unless user manually edited
  useEffect(() => {
    const qty = Math.max(1, Number.parseFloat(quantity) || 1)
    if (baseCalories !== null && !caloriesEdited) setCalories(String(Math.round(baseCalories * qty)))
    if (baseProtein !== null && !proteinEdited) setProtein(String(Math.round(baseProtein * qty)))
    if (baseCarbs !== null && !carbsEdited) setCarbs(String(Math.round(baseCarbs * qty)))
    if (baseFat !== null && !fatEdited) setFat(String(Math.round(baseFat * qty)))
  }, [quantity, baseCalories, baseProtein, baseCarbs, baseFat, caloriesEdited, proteinEdited, carbsEdited, fatEdited])

  const selectFood = (food: { name: string; calories: number; protein: number; carbs: number; fat: number; type: string; emoji?: string }) => {
    setFoodItem(food.name)
    // set base per-serving values and reset edited flags so auto-scaling is enabled
    setBaseCalories(food.calories)
    setBaseProtein(food.protein)
    setBaseCarbs(food.carbs)
    setBaseFat(food.fat)
    setCalories(food.calories.toString())
    setProtein(food.protein.toString())
    setCarbs(food.carbs.toString())
    setFat(food.fat.toString())
    setQuantity("1")
    setCaloriesEdited(false)
    setProteinEdited(false)
    setCarbsEdited(false)
    setFatEdited(false)
    setShowSuggestions(false)
  }

  const handleAddCustomFood = () => {
    const name = (newFoodName || foodItem || '').trim()
    if (!name) return alert('Please provide a food name')
    const cals = Math.max(0, Number.parseFloat(newFoodCalories) || 0)
    const prot = Math.max(0, Number.parseFloat(newFoodProtein) || 0)
    const carbsN = Math.max(0, Number.parseFloat(newFoodCarbs) || 0)
    const fatN = Math.max(0, Number.parseFloat(newFoodFat) || 0)

    const item = { name, calories: cals, protein: prot, carbs: carbsN, fat: fatN, type: mealType || 'Snack', emoji: newFoodEmoji || undefined }

    // Try server persistence first for authenticated users
    ;(async () => {
      try {
        const res = await apiFetch('/custom-foods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        })
        if (res && res.ok) {
          const created = await res.json()
          const createdItem = { ...item, id: created.id }
          const updated = [createdItem, ...customFoods]
          setCustomFoods(updated)
          // update suggestions
          setFilteredFoods((prev) => [createdItem, ...prev])
          selectFood(createdItem)
          // persist locally as cache
          try { localStorage.setItem('customFoods', JSON.stringify(updated)) } catch (e) { }
          // reset form
          setNewFoodName('')
          setNewFoodCalories('')
          setNewFoodProtein('')
          setNewFoodCarbs('')
          setNewFoodFat('')
          setNewFoodEmoji('')
          setShowAddForm(false)
          setShowSuggestions(false)
          return
        }
      } catch (e) {
        // ignore and fallback to localStorage
      }

      try {
        const updated = [item, ...customFoods]
        setCustomFoods(updated)
        localStorage.setItem('customFoods', JSON.stringify(updated))
        setFilteredFoods((prev) => [item, ...prev])
        selectFood(item)
        setNewFoodName('')
        setNewFoodCalories('')
        setNewFoodProtein('')
        setNewFoodCarbs('')
        setNewFoodFat('')
        setNewFoodEmoji('')
        setShowAddForm(false)
        setShowSuggestions(false)
      } catch (e) {
        console.error(e)
        alert('Failed to save custom food')
      }
    })()
  }

  const logNutrition = () => {
    if (!mealType || !foodItem || !calories || !protein || !carbs || !fat || !quantity) {
      alert("Please fill in all fields")
      return
    }

    const qty = Math.max(1, Number.parseFloat(quantity) || 1)
    const foodData = INDIAN_FOODS.find((f) => f.name.toLowerCase() === foodItem.toLowerCase())

    // multiply nutrition values by quantity (assume values are per serving)
    const cal = Math.round(Number.parseFloat(calories) * qty)
    const prot = Math.round(Number.parseFloat(protein) * qty)
    const carb = Math.round(Number.parseFloat(carbs) * qty)
    const f = Math.round(Number.parseFloat(fat) * qty)

    const newMeal: NewMeal = {
      // id will be set when persisted to backend; local fallback uses timestamp-based id
      type: mealType,
      food: foodItem,
      calories: cal,
      protein: prot,
      carbs: carb,
      fat: f,
      quantity: qty,
      timestamp: new Date().toISOString(),
      emoji: foodData?.emoji,
    };

    // Try to persist to backend for authenticated users. If that succeeds,
    // attach returned id to the meal so future deletes call the API.
    (async () => {
      try {
        const res = await apiFetch('/nutrition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: newMeal, timestamp: newMeal.timestamp }),
        })

        if (res && res.ok) {
          try {
            const created: ServerLog = await res.json()
            if (created && created.id) newMeal.id = String(created.id)
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        // ignore network/auth errors and fallback to localStorage
      }

  // always keep local copy for offline/anonymous users
      const stored = localStorage.getItem("nutritionMeals")
      const allMeals = stored ? JSON.parse(stored) : []
      // generate a local id if server didn't provide one
      if (!newMeal.id) newMeal.id = (Date.now()).toString()
      const savedMeal: Meal = { ...newMeal, id: newMeal.id }
      const updated = [...allMeals, savedMeal]
      localStorage.setItem("nutritionMeals", JSON.stringify(updated))
      setMeals((prev) => [...prev, savedMeal])
    })()

    // Reset form
    setMealType("")
    setFoodItem("")
    setCalories("")
    setProtein("")
    setCarbs("")
    setFat("")
    setQuantity("1")
  }

  const deleteMeal = (id: string) => {
    ;(async () => {
      // try backend delete if id looks like a server id (numeric)
      try {
        if (/^\d+$/.test(id)) {
          const res = await apiFetch(`/nutrition/${id}`, { method: 'DELETE' })
          if (res && res.ok) {
            // remove local copy too
            const stored = localStorage.getItem("nutritionMeals")
            if (stored) {
              const allMeals = JSON.parse(stored)
              const updated = allMeals.filter((m: Meal) => m.id !== id)
              localStorage.setItem("nutritionMeals", JSON.stringify(updated))
              setMeals(meals.filter((m) => m.id !== id))
            }
            return
          }
        }
      } catch (e) {
        // ignore
      }

      // fallback: remove from localStorage
      const stored = localStorage.getItem("nutritionMeals")
      if (stored) {
        const allMeals = JSON.parse(stored)
        const updated = allMeals.filter((m: Meal) => m.id !== id)
        localStorage.setItem("nutritionMeals", JSON.stringify(updated))
        setMeals(meals.filter((m) => m.id !== id))
      }
    })()
  }

  const calculateBMI = () => {
    if (!weight || !height) {
      alert("Please enter both weight and height")
      return
    }

    const w = Number.parseFloat(weight)
    const h = Number.parseFloat(height) / 100 // convert cm to m
    const bmi = w / (h * h)

    let category = ""
    let color = ""

    if (bmi < 18.5) {
      category = "Underweight"
      color = "text-blue-600"
    } else if (bmi < 25) {
      category = "Normal weight"
      color = "text-green-600"
    } else if (bmi < 30) {
      category = "Overweight"
      color = "text-orange-600"
    } else {
      category = "Obese"
      color = "text-red-600"
    }

    setBmiResult({ bmi: Number.parseFloat(bmi.toFixed(1)), category, color })
  }

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0)
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0)
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0)
  const totalFat = meals.reduce((sum, m) => sum + m.fat, 0)

  const getMealIcon = (type: string) => {
    switch (type) {
      case "Breakfast":
        return <Coffee className="w-4 h-4" />
      case "Lunch":
        return <Soup className="w-4 h-4" />
      case "Dinner":
        return <UtensilsCrossed className="w-4 h-4" />
      case "Snack":
        return <Apple className="w-4 h-4" />
      default:
        return <Salad className="w-4 h-4" />
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showSuggestions])

  return (
    <div className="flex min-h-screen bg-green-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Nutrition Logger */}
          <Card className="p-8 bg-white/95 backdrop-blur-sm shadow-xl hover-3d">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center animate-bounce">
                <Salad className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent animate-pulse">
                  Nutrition Logger
                </h2>
                <p className="text-gray-600">Track your daily nutrition and maintain a healthy diet</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <div>
                <Label className="text-gray-700 font-medium animate-pulse">Meal Type</Label>
                <select
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-medium hover:border-orange-400 transition-all"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                >
                  <option value="">Select meal type</option>
                  <option value="Breakfast">☕ Breakfast</option>
                  <option value="Lunch">🍲 Lunch</option>
                  <option value="Dinner">🍽️ Dinner</option>
                  <option value="Snack">🍎 Snack</option>
                </select>
              </div>

              <div className="relative" ref={suggestionsRef}>
                <Label className="text-gray-700 font-medium animate-pulse">Food Item</Label>
                <Input
                  placeholder="e.g., Grilled Chicken, Oatmeal"
                  value={foodItem}
                  onChange={(e) => setFoodItem(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="mt-2 p-3 border-gray-300 focus:ring-2 focus:ring-orange-500 hover:border-orange-400 transition-all"
                />
                {showSuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-2 flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">Select Food</span>
                      <button
                        type="button"
                        onClick={() => setShowSuggestions(false)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    {filteredFoods.map((food, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectFood(food)}
                        className="w-full px-4 py-3 text-left hover:bg-orange-50 flex items-center gap-3 border-b border-gray-100 transition-colors"
                      >
                        <span className="text-2xl">{food.emoji}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{food.name}</p>
                          <p className="text-xs text-gray-600">
                            {food.calories} cal • {food.protein}g protein
                          </p>
                        </div>
                      </button>
                    ))}
                    {/* If typed food isn't in the list, offer to add it */}
                    {filteredFoods.length === 0 && foodItem.trim() !== "" && (
                      <div className="p-3 border-t border-gray-100">
                        {!showAddForm ? (
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">No matches for "{foodItem}"</div>
                            <button
                              type="button"
                              onClick={() => { setShowAddForm(true); setNewFoodName(foodItem) }}
                              className="text-sm text-primary font-semibold hover:underline"
                            >
                              Add "{foodItem}"
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 p-2 bg-gray-50 rounded">
                            <Input value={newFoodName} onChange={(e)=>setNewFoodName(e.target.value)} placeholder="Food name" />
                            <div className="grid grid-cols-2 gap-2">
                              <Input value={newFoodCalories} onChange={(e)=>setNewFoodCalories(e.target.value)} placeholder="Calories" />
                              <Input value={newFoodProtein} onChange={(e)=>setNewFoodProtein(e.target.value)} placeholder="Protein (g)" />
                              <Input value={newFoodCarbs} onChange={(e)=>setNewFoodCarbs(e.target.value)} placeholder="Carbs (g)" />
                              <Input value={newFoodFat} onChange={(e)=>setNewFoodFat(e.target.value)} placeholder="Fat (g)" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Input value={newFoodEmoji} onChange={(e)=>setNewFoodEmoji(e.target.value)} placeholder="Emoji (optional)" />
                              <Button onClick={handleAddCustomFood} className="ml-auto">Add Food</Button>
                              <Button variant="ghost" onClick={()=>setShowAddForm(false)}>Cancel</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-gray-700 font-medium animate-pulse">Quantity (servings)</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-2 p-3 border-gray-300 focus:ring-2 focus:ring-orange-500 hover:border-orange-400 transition-all"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-medium animate-pulse">Calories</Label>
                <Input
                  type="number"
                  placeholder="320"
                  value={calories}
                  onChange={(e) => { setCalories(e.target.value); setCaloriesEdited(true) }}
                  className="mt-2 p-3 border-gray-300 focus:ring-2 focus:ring-orange-500 hover:border-orange-400 transition-all"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-medium animate-pulse">Protein (g)</Label>
                <Input
                  type="number"
                  placeholder="12"
                  value={protein}
                  onChange={(e) => { setProtein(e.target.value); setProteinEdited(true) }}
                  className="mt-2 p-3 border-gray-300 focus:ring-2 focus:ring-orange-500 hover:border-orange-400 transition-all"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-medium animate-pulse">Carbs (g)</Label>
                <Input
                  type="number"
                  placeholder="45"
                  value={carbs}
                  onChange={(e) => { setCarbs(e.target.value); setCarbsEdited(true) }}
                  className="mt-2 p-3 border-gray-300 focus:ring-2 focus:ring-orange-500 hover:border-orange-400 transition-all"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-medium animate-pulse">Fat (g)</Label>
                <Input
                  type="number"
                  placeholder="8"
                  value={fat}
                  onChange={(e) => { setFat(e.target.value); setFatEdited(true) }}
                  className="mt-2 p-3 border-gray-300 focus:ring-2 focus:ring-orange-500 hover:border-orange-400 transition-all"
                />
              </div>
            </div>

            <Button
              onClick={logNutrition}
              className="w-full mt-6 py-6 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg transform hover:scale-105 transition-transform"
            >
              Log Nutrition
            </Button>
          </Card>

          {/* Today's Nutrition */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent drop-shadow-lg animate-pulse mb-4">
              Today's Nutrition
            </h3>
            {meals.length === 0 ? (
              <Card className="p-8 bg-white/95 backdrop-blur-sm text-center hover-3d">
                <p className="text-gray-500">No meals logged yet. Start tracking your nutrition above!</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {meals.map((meal) => (
                  <Card key={meal.id} className="p-4 bg-white/95 backdrop-blur-sm shadow-lg hover-3d">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0 text-2xl animate-bounce">
                          {meal.emoji || "🍽️"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getMealIcon(meal.type)}
                            <h4 className="font-bold text-gray-900">
                                {meal.type} - {meal.food} {meal.quantity ? ` (x${meal.quantity})` : ''}
                              </h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            {meal.calories} calories • {meal.protein}g protein • {meal.carbs}g carbs • {meal.fat}g fat
                          </p>
                        </div>
                        <Check className="w-6 h-6 text-green-600" />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteMeal(meal.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </Card>
                ))}

                {/* Daily Summary */}
                <Card className="p-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl hover-3d">
                  <h4 className="text-lg font-bold mb-3 animate-pulse">Daily Summary</h4>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold">{totalCalories}</p>
                      <p className="text-sm opacity-90">Calories</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{totalProtein}g</p>
                      <p className="text-sm opacity-90">Protein</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{totalCarbs}g</p>
                      <p className="text-sm opacity-90">Carbs</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{totalFat}g</p>
                      <p className="text-sm opacity-90">Fat</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* BMI Calculator */}
          <Card className="p-8 bg-white/95 backdrop-blur-sm shadow-xl hover-3d">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center animate-bounce">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
                  BMI Calculator
                </h2>
                <p className="text-gray-600">Calculate your Body Mass Index to understand your health status</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div>
                <Label className="text-gray-700 font-medium animate-pulse">Weight (kg)</Label>
                <Input
                  type="number"
                  placeholder="70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="mt-2 p-3 border-gray-300 focus:ring-2 focus:ring-orange-500 hover:border-orange-400 transition-all"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-medium animate-pulse">Height (cm)</Label>
                <Input
                  type="number"
                  placeholder="170"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="mt-2 p-3 border-gray-300 focus:ring-2 focus:ring-orange-500 hover:border-orange-400 transition-all"
                />
              </div>
            </div>

            <Button
              onClick={calculateBMI}
              className="w-full mt-6 py-6 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg transform hover:scale-105 transition-transform"
            >
              Calculate BMI
            </Button>

            {bmiResult && (
              <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 animate-fade-in">
                <div className="text-center">
                  <p className="text-gray-600 mb-2">Your BMI</p>
                  <p className={`text-5xl font-bold ${bmiResult.color} mb-2`}>{bmiResult.bmi}</p>
                  <p className={`text-xl font-semibold ${bmiResult.color}`}>{bmiResult.category}</p>
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">BMI Categories:</span> Underweight (&lt;18.5) • Normal (18.5-24.9)
                      • Overweight (25-29.9) • Obese (≥30)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Nutrition Tips with Images */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent drop-shadow-lg animate-pulse mb-4">
              Nutrition Tips
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4 bg-white/95 backdrop-blur-sm shadow-lg hover-3d overflow-hidden">
                <img
                  src="/healthy-colorful-salad-bowl.jpg"
                  alt="Healthy salad"
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h4 className="font-bold text-gray-900 mb-1">Eat More Vegetables</h4>
                <p className="text-sm text-gray-600">
                  Fill half your plate with colorful vegetables for optimal nutrition
                </p>
              </Card>

              <Card className="p-4 bg-white/95 backdrop-blur-sm shadow-lg hover-3d overflow-hidden">
                <img
                  src="/protein-rich-foods-chicken-fish-eggs.jpg"
                  alt="Protein foods"
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h4 className="font-bold text-gray-900 mb-1">Prioritize Protein</h4>
                <p className="text-sm text-gray-600">Include lean protein sources in every meal for muscle health</p>
              </Card>

              <Card className="p-4 bg-white/95 backdrop-blur-sm shadow-lg hover-3d overflow-hidden">
                <img
                  src="/water-bottle-hydration.jpg"
                  alt="Hydration"
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h4 className="font-bold text-gray-900 mb-1">Stay Hydrated</h4>
                <p className="text-sm text-gray-600">Drink at least 8 glasses of water daily for optimal health</p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
