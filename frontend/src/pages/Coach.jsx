import React, { useState, useEffect } from "react";
import {
  Brain,
  Sparkles,
  Loader2,
  ChevronDown,
  Dumbbell,
  Utensils,
  Flame,
  Target,
  Moon,
  Zap,
  Trash2 // 🔥 Naya icon delete button ke liye
} from "lucide-react";
import { aiApi } from "../api/services";

const GOAL_OPTIONS = ["Lean Bulk", "Fat Loss", "Body Recomposition", "Maintenance"];
const DIET_OPTIONS = ["Non-Veg", "Veg", "Vegan", "Eggetarian"];
const WORKOUT_OPTIONS = [
  "Gym (Full Equipment)",
  "Home (Bodyweight Only - No Equipment)",
  "Home (With Dumbbells)"
];

function SelectField({ label, value, onChange, options, icon: Icon }) {
  return (
    <div>
      <label className="label-text">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`input-field appearance-none cursor-pointer ${Icon ? "pl-10" : ""} pr-10`}
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-slate-900">
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        />
      </div>
    </div>
  );
}

function WorkoutDayAccordion({ day, isOpen, onToggle }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden transition-all duration-300">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-800/40 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              day.restDay ? "bg-slate-700/40 text-slate-400" : "bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {day.restDay ? <Moon size={16} /> : <Dumbbell size={16} />}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-100">{day.day}</p>
            <p className="text-xs text-slate-500">{day.focus}</p>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-500 transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 animate-fade-in">
          {day.exercises?.length ? (
            <ul className="space-y-1.5">
              {day.exercises.map((ex, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-300 pl-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  {ex}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Rest and recover — let those muscles grow.</p>
          )}
        </div>
      )}
    </div>
  );
}

function MealDayAccordion({ day, isOpen, onToggle }) {
  const dayTotal = day.meals?.reduce((sum, m) => sum + (m.estimatedCalories || 0), 0) || 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden transition-all duration-300">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-800/40 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Utensils size={16} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-100">{day.day}</p>
            <p className="text-xs text-slate-500">~{Math.round(dayTotal)} kcal total</p>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-500 transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 space-y-2 animate-fade-in">
          {day.meals?.map((meal, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-3 px-3 py-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60"
            >
              <div>
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-0.5">
                  {meal.mealType}
                </p>
                <p className="text-sm text-slate-300">{meal.description}</p>
              </div>
              {meal.estimatedCalories != null && (
                <span className="text-xs font-medium text-slate-500 flex-shrink-0 whitespace-nowrap">
                  {Math.round(meal.estimatedCalories)} kcal
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CoachPage() {
  const [goal, setGoal] = useState(GOAL_OPTIONS[0]);
  const [dietPreference, setDietPreference] = useState(DIET_OPTIONS[0]);
  const [workoutStyle, setWorkoutStyle] = useState(WORKOUT_OPTIONS[0]);

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true); // 🔥 Page load loading state
  const [error, setError] = useState("");

  const [openWorkoutDay, setOpenWorkoutDay] = useState(0);
  const [openMealDay, setOpenMealDay] = useState(null);
  const [activeTab, setActiveTab] = useState("workout"); // 'workout' | 'meals'

 // 🔥 UPDATED useEffect
  useEffect(() => {
    const fetchSavedPlan = async () => {
      try {
        const { data } = await aiApi.getMyPlan(); // Ab ye function exist karta hai!
        if (data) {
          // Backend se agar string format me aaya to usko JSON object me badal do
          const parsedPlan = typeof data === 'string' ? JSON.parse(data) : data;
          setPlan(parsedPlan);
        }
      } catch (err) {
        // Console me error dikhega agar plan save nahi hoga, jo ki normal hai
        console.log("Koi purana plan nahi mila ya fetch nahi hua."); 
      } finally {
        setIsFetching(false);
      }
    };
    fetchSavedPlan();
  }, []);

  // 🔥 NAYA FUNCTION PLAN DELETE KARNE KE LIYE
  const handleDeletePlan = async () => {
    if (!window.confirm("Are you sure you want to delete your current plan?")) return;
    
    setIsFetching(true);
    try {
      await aiApi.deleteMyPlan();
      setPlan(null);
      setOpenWorkoutDay(0);
      setOpenMealDay(null);
    } catch (err) {
      setError("Failed to delete plan. Please try again.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setPlan(null);
    try {
      const { data } = await aiApi.generatePlan({ goal, dietPreference, workoutStyle });
      setPlan(data);
      setOpenWorkoutDay(0);
      setOpenMealDay(null);
      setActiveTab("workout");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't generate your plan right now. Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
          <Brain size={22} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Personal Coach</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            A custom 7-day workout & meal plan, generated for your exact goals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Intake form */}
        <div className="lg:col-span-2 glass-card p-5 sm:p-6 h-fit lg:sticky lg:top-6">
          <h2 className="text-sm font-semibold text-slate-100 mb-4">Tell us your goals</h2>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
            <SelectField label="Primary Goal" value={goal} onChange={setGoal} options={GOAL_OPTIONS} icon={Target} />
            <SelectField
              label="Diet Preference"
              value={dietPreference}
              onChange={setDietPreference}
              options={DIET_OPTIONS}
              icon={Utensils}
            />
            <SelectField
              label="Workout Style"
              value={workoutStyle}
              onChange={setWorkoutStyle}
              options={WORKOUT_OPTIONS}
              icon={Dumbbell}
            />

            <button type="submit" disabled={loading || isFetching} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? "Crafting your plan..." : "Generate My Plan"}
            </button>
            
            {/* 🔥 Delete Plan Button - Sirf tab dikhega jab plan majood hoga */}
            {plan && (
              <button
                type="button"
                onClick={handleDeletePlan}
                disabled={loading || isFetching}
                className="w-full mt-2 py-2.5 rounded-lg border border-red-500/30 text-red-400 font-semibold text-sm hover:bg-red-500/10 flex items-center justify-center gap-2 transition-all"
              >
                <Trash2 size={16} />
                Clear Current Plan
              </button>
            )}
          </form>

          <p className="text-xs text-slate-600 mt-4 leading-relaxed">
            We use your current weight, height, and age from your profile to tailor calorie and
            protein targets alongside your selections above.
          </p>
        </div>

        {/* Plan display area */}
        <div className="lg:col-span-3">
          {/* 🔥 Modified Loading UI to handle both Generating and Fetching */}
          {(loading || isFetching) && (
            <div className="glass-card p-10 flex flex-col items-center justify-center text-center gap-3 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <Brain size={26} className="text-emerald-400 animate-pulse" />
              </div>
              <p className="text-sm font-medium text-slate-200">
                {loading ? "AI is crafting your perfect plan..." : "Fetching your saved plan..."}
              </p>
              <p className="text-xs text-slate-500 max-w-xs">
                {loading 
                  ? "Analyzing your profile and building a personalized 7-day routine. This can take a few seconds." 
                  : "Loading your data from the database."}
              </p>
            </div>
          )}

          {!loading && !isFetching && !plan && (
            <div className="glass-card p-10 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/60 flex items-center justify-center">
                <Zap size={24} className="text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-300">No plan generated yet</p>
              <p className="text-xs text-slate-500 max-w-xs">
                Fill in your goals on the left and let your AI coach build a personalized plan.
              </p>
            </div>
          )}

          {!loading && !isFetching && plan && (
            <div className="space-y-4 animate-fade-in">
              {/* Summary card */}
              <div className="glass-card p-5 sm:p-6 hover:shadow-glow">
                <div className="flex items-start gap-3 mb-4">
                  <Sparkles size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">{plan.summary}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-900/50 border border-slate-800 px-4 py-3 flex items-center gap-3">
                    <Flame className="text-emerald-400 flex-shrink-0" size={18} />
                    <div>
                      <p className="text-lg font-bold text-slate-50">{Math.round(plan.dailyCalorieTarget)}</p>
                      <p className="text-xs text-slate-500">kcal / day target</p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-900/50 border border-slate-800 px-4 py-3 flex items-center gap-3">
                    <Target className="text-emerald-400 flex-shrink-0" size={18} />
                    <div>
                      <p className="text-lg font-bold text-slate-50">{Math.round(plan.dailyProteinTargetGrams)}g</p>
                      <p className="text-xs text-slate-500">protein / day target</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab switcher */}
              <div className="flex bg-slate-900/60 rounded-xl p-1 border border-slate-800">
                <button
                  onClick={() => setActiveTab("workout")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    activeTab === "workout" ? "bg-emerald-500 text-slate-900" : "text-slate-400"
                  }`}
                >
                  <Dumbbell size={15} />
                  Workout Split
                </button>
                <button
                  onClick={() => setActiveTab("meals")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    activeTab === "meals" ? "bg-emerald-500 text-slate-900" : "text-slate-400"
                  }`}
                >
                  <Utensils size={15} />
                  Meal Plan
                </button>
              </div>

              {/* Weekly workout accordion */}
              {activeTab === "workout" && (
                <div className="space-y-2">
                  {plan.weeklyWorkoutPlan?.map((day, idx) => (
                    <WorkoutDayAccordion
                      key={idx}
                      day={day}
                      isOpen={openWorkoutDay === idx}
                      onToggle={() => setOpenWorkoutDay(openWorkoutDay === idx ? null : idx)}
                    />
                  ))}
                </div>
              )}

              {/* Weekly meal accordion */}
              {activeTab === "meals" && (
                <div className="space-y-2">
                  {plan.weeklyMealPlan?.map((day, idx) => (
                    <MealDayAccordion
                      key={idx}
                      day={day}
                      isOpen={openMealDay === idx}
                      onToggle={() => setOpenMealDay(openMealDay === idx ? null : idx)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}