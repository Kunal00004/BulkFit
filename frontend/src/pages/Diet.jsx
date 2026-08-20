import React, { useEffect, useState, useRef, useCallback } from "react";
import { Search, Plus, Trash2, Utensils, ChevronDown } from "lucide-react";
import { dietApi } from "../api/services";
import CalorieProgressBar from "../components/CalorieProgressBar.jsx";

const MEAL_TYPES = ["BREAKFAST", "LUNCH", "SNACKS", "DINNER"];

function FoodSearchDropdown({ onSelect, selectedFood }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  const search = useCallback(async (q) => {
    setLoading(true);
    try {
      const { data } = await dietApi.searchFoods(q);
      setResults(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (open) search(query);
    }, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="label-text">Food Item</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input-field flex items-center justify-between text-left"
      >
        <span className={selectedFood ? "text-slate-100" : "text-slate-500"}>
          {selectedFood ? selectedFood.name : "Search for a food item..."}
        </span>
        <ChevronDown size={16} className={`text-slate-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full glass-card p-2 max-h-72 overflow-y-auto animate-fade-in bg-slate-800/95">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input
              autoFocus
              className="w-full bg-slate-900/70 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              placeholder="e.g. chicken, oats, whey..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="text-xs text-slate-500 text-center py-4">Searching...</p>
          ) : results.length ? (
            results.map((food) => (
              <button
                key={food.id}
                type="button"
                onClick={() => {
                  onSelect(food);
                  setOpen(false);
                  setQuery("");
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-emerald-500/10 transition-all duration-200 text-left"
              >
                <span className="text-sm text-slate-200">{food.name}</span>
                <span className="text-xs text-slate-500">{food.caloriesPer100g} kcal/100g</span>
              </button>
            ))
          ) : (
            <p className="text-xs text-slate-500 text-center py-4">No food items found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function DietPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [mealType, setMealType] = useState("BREAKFAST");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadSummary = async () => {
    const { data } = await dietApi.getSummary();
    setSummary(data);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadSummary();
      setLoading(false);
    })();
  }, []);

  const handleLogFood = async (e) => {
    e.preventDefault();
    setError("");
    if (!selectedFood) {
      setError("Please select a food item first");
      return;
    }
    setSubmitting(true);
    try {
      await dietApi.logFood({
        foodItemId: selectedFood.id,
        quantityGrams: Number(quantity),
        mealType,
      });
      setSelectedFood(null);
      setQuantity(100);
      await loadSummary();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to log food");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    await dietApi.deleteLog(id);
    await loadSummary();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-slate-500 animate-pulse">Loading diet data...</div>;
  }

  const previewCalories = selectedFood ? Math.round((selectedFood.caloriesPer100g * quantity) / 100) : 0;
  const previewProtein = selectedFood ? Math.round((selectedFood.proteinPer100g * quantity) / 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Diet Logger</h1>
        <p className="text-slate-500 text-sm mt-1">Fuel the surplus. Every gram counts toward mass.</p>
      </div>

      <CalorieProgressBar
        consumed={summary.caloriesConsumed}
        goal={summary.calorieGoal}
        surplusOrDeficit={summary.surplusOrDeficit}
        goalMet={summary.goalMet}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Log form */}
        <div className="lg:col-span-2 glass-card p-5 sm:p-6 h-fit">
          <h2 className="text-sm font-semibold text-slate-100 mb-4">Log a Meal</h2>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogFood} className="space-y-4">
            <FoodSearchDropdown onSelect={setSelectedFood} selectedFood={selectedFood} />

            <div>
              <label className="label-text">Quantity (grams)</label>
              <input
                type="number"
                min={1}
                required
                className="input-field"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div>
              <label className="label-text">Meal Type</label>
              <div className="grid grid-cols-2 gap-2">
                {MEAL_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMealType(type)}
                    className={`py-2.5 rounded-xl text-xs font-semibold capitalize transition-all duration-300 border ${
                      mealType === type
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                        : "bg-slate-900/40 border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {type.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {selectedFood && (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-sm animate-fade-in">
                <span className="text-slate-400">Preview</span>
                <span className="font-semibold text-emerald-400">
                  {previewCalories} kcal · {previewProtein}g protein
                </span>
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
              <Plus size={16} />
              {submitting ? "Logging..." : "Log Meal"}
            </button>
          </form>
        </div>

        {/* Today's logs */}
        <div className="lg:col-span-3 glass-card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Utensils size={16} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-100">Today's Meals</h2>
          </div>

          {summary.logs?.length ? (
            <div className="space-y-2">
              {summary.logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all duration-300"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-200">{log.foodItem.name}</p>
                    <p className="text-xs text-slate-500 capitalize">
                      {log.mealType.toLowerCase()} · {log.quantityGrams}g
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-400">{Math.round(log.calories)} kcal</p>
                      <p className="text-xs text-slate-500">{Math.round(log.protein)}g protein</p>
                    </div>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="text-slate-600 hover:text-red-400 transition-all duration-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-8 text-center">No meals logged today. Start fueling your bulk!</p>
          )}
        </div>
      </div>
    </div>
  );
}
