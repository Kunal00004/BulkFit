import React, { useEffect, useState, useRef, useCallback } from "react";
import { Search, Plus, Trash2, Utensils, ChevronDown, Camera, Loader2, Sparkles, CheckCircle2, Minus, Flame, Beef, Wheat, Droplet, Info, ScanLine } from "lucide-react";
import { dietApi, aiApi } from "../api/services";
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
  }, [query, open, search]);

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

  // AI Scanner States
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedResult, setScannedResult] = useState(null); 
  const [imagePreview, setImagePreview] = useState(null); // Added for Laser Scan preview
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef(null);

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

  // Normal Manual Log
  const handleLogFood = async (e) => {
    e.preventDefault();
    setError("");
    if (!selectedFood) return setError("Please select a food item first");
    
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

  // 📸 Trigger AI Scan & Fake Loader
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show Image Preview for Laser Effect
    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);

    setError("");
    setScannedResult(null);
    setSuccessMsg("");
    setScanning(true);
    setScanProgress(0);

    // Fake Progress Animation
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => (prev >= 95 ? 95 : prev + Math.floor(Math.random() * 15) + 5));
    }, 400);

    try {
      const { data: scan } = await aiApi.scanFood(file);
      clearInterval(progressInterval);
      setScanProgress(100);
      
      setTimeout(() => {
        setScannedResult(scan);
        setScanning(false);
        setImagePreview(null);
      }, 700);

    } catch (err) {
      clearInterval(progressInterval);
      setScanning(false);
      setImagePreview(null);
      setError(err.response?.data?.message || "Couldn't analyze that image. Try a clearer photo.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Updates weight in the scanned list
  const updateScannedItemWeight = (index, delta) => {
    const updatedItems = [...scannedResult.items];
    const newWeight = Math.max(10, updatedItems[index].estimatedWeightGrams + delta);
    updatedItems[index].estimatedWeightGrams = newWeight;
    setScannedResult({ ...scannedResult, items: updatedItems });
  };

  const removeScannedItem = (index) => {
    const updatedItems = scannedResult.items.filter((_, i) => i !== index);
    setScannedResult({ ...scannedResult, items: updatedItems });
  };

  // Logs all items in the scanned result
  const handleLogScannedBatch = async () => {
    if (!scannedResult?.items?.length) return;
    setSubmitting(true);
    
    // Calculate total calories to show in success message
    const totalAddedCals = scannedResult.items.reduce((acc, item) => {
      return acc + ((item.caloriesPer100g * item.estimatedWeightGrams) / 100);
    }, 0);

    try {
      await Promise.all(
        scannedResult.items.map(async (item) => {
          const { data: foodItem } = await dietApi.findOrCreateFood({
            name: item.foodName,
            caloriesPer100g: item.caloriesPer100g,
            proteinPer100g: item.proteinPer100g,
          });
          return dietApi.logFood({
            foodItemId: foodItem.id,
            quantityGrams: Number(item.estimatedWeightGrams),
            mealType,
          });
        })
      );
      
      await loadSummary();
      setSuccessMsg(`Awesome! Added ${Math.round(totalAddedCals)} calories to your ${mealType.toLowerCase()}. 🔥`);
      setScannedResult(null);
    } catch (err) {
      setError("Failed to log one or more scanned items.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96 text-slate-500 animate-pulse">Loading diet data...</div>;

  // Real-time Total Macros calculation (with fallbacks if AI misses data)
  const activeScannedItems = scannedResult?.items || [];
  const totals = activeScannedItems.reduce((acc, item) => {
    const multiplier = item.estimatedWeightGrams / 100;
    return {
      cals: acc.cals + ((item.caloriesPer100g || 0) * multiplier),
      prot: acc.prot + ((item.proteinPer100g || 0) * multiplier),
      carb: acc.carb + ((item.carbsPer100g || 0) * multiplier),
      fat: acc.fat + ((item.fatPer100g || 0) * multiplier),
    };
  }, { cals: 0, prot: 0, carb: 0, fat: 0 });

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* 🚀 1. THE "TECHY" LASER SCAN OVERLAY */}
      {scanning && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in">
          
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl mb-8 bg-slate-900">
            {/* User Uploaded Image Preview */}
            {imagePreview && <img src={imagePreview} alt="scanning" className="w-full h-full object-cover opacity-60" />}
            
            {/* Glowing Laser Scan Line */}
            <div 
              className="absolute left-0 w-full h-[3px] bg-emerald-400 shadow-[0_0_25px_8px_rgba(52,211,119,0.7)] transition-all duration-300 ease-linear flex items-center justify-center"
              style={{ top: `${scanProgress}%` }}
            >
              <ScanLine className="text-white absolute opacity-50" size={32} />
            </div>

            {/* Corner Bracket UI Details */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-emerald-500"></div>
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-500"></div>
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-500"></div>
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-emerald-500"></div>
          </div>

          <h2 className="text-4xl font-black text-slate-100 mb-2">{scanProgress}%</h2>
          <p className="text-sm text-emerald-400 font-medium tracking-wide">
            {scanProgress < 30 ? "Extracting image data..." : scanProgress < 70 ? "Identifying ingredients via AI..." : "Calculating accurate macros..."}
          </p>
        </div>
      )}

      {/* 🎉 2. SUCCESS MODAL */}
      {successMsg && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-emerald-500/50 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl space-y-5 transform transition-all">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">Meal Logged!</h3>
              <p className="text-sm text-slate-400">{successMsg}</p>
            </div>
            <button onClick={() => setSuccessMsg("")} className="btn-primary w-full py-3">View Progress</button>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Diet Logger</h1>
        <p className="text-slate-500 text-sm mt-1">Fuel the surplus. Every gram counts toward mass.</p>
      </div>

      <CalorieProgressBar consumed={summary.caloriesConsumed} goal={summary.calorieGoal} surplusOrDeficit={summary.surplusOrDeficit} goalMet={summary.goalMet} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT COLUMN: LOGGING AREA */}
        <div className="lg:col-span-2 space-y-4">
          
          {error && <div className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{error}</div>}

          {/* 📱 3. RICH AI RESULT CARD */}
          {scannedResult ? (
            <div className="glass-card p-5 border border-emerald-500/40 bg-slate-900/90 shadow-2xl animate-fade-in space-y-5">
              
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-1">
                    <Sparkles size={18} className="text-emerald-400" /> AI Analysis
                  </h2>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 w-fit">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    <span className="text-[10px] text-emerald-300 font-bold tracking-widest uppercase">Trained on 10,000+ foods</span>
                  </div>
                </div>
                <button onClick={() => setScannedResult(null)} className="p-1.5 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">✕</button>
              </div>

              {activeScannedItems.length === 0 ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Info size={24} className="text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-300 font-medium">Couldn't identify the food clearly.</p>
                  <p className="text-xs text-slate-500">Please try again with a better lit or closer photo.</p>
                </div>
              ) : (
                <>
                  {/* Top Macros UI with Icons */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-slate-950/60 py-3 px-1 rounded-xl border border-slate-800 shadow-inner flex flex-col items-center">
                      <Flame size={16} className="text-orange-400 mb-1 opacity-80" />
                      <p className="text-orange-400 font-black text-sm">{Math.round(totals.cals)}</p>
                      <p className="text-[9px] text-slate-500 uppercase mt-0.5">Kcal</p>
                    </div>
                    <div className="bg-slate-950/60 py-3 px-1 rounded-xl border border-slate-800 shadow-inner flex flex-col items-center">
                      <Beef size={16} className="text-emerald-400 mb-1 opacity-80" />
                      <p className="text-emerald-400 font-black text-sm">{Math.round(totals.prot)}g</p>
                      <p className="text-[9px] text-slate-500 uppercase mt-0.5">Protein</p>
                    </div>
                    <div className="bg-slate-950/60 py-3 px-1 rounded-xl border border-slate-800 shadow-inner flex flex-col items-center">
                      <Wheat size={16} className="text-blue-400 mb-1 opacity-80" />
                      <p className="text-blue-400 font-black text-sm">{Math.round(totals.carb)}g</p>
                      <p className="text-[9px] text-slate-500 uppercase mt-0.5">Carbs</p>
                    </div>
                    <div className="bg-slate-950/60 py-3 px-1 rounded-xl border border-slate-800 shadow-inner flex flex-col items-center">
                      <Droplet size={16} className="text-amber-400 mb-1 opacity-80" />
                      <p className="text-amber-400 font-black text-sm">{Math.round(totals.fat)}g</p>
                      <p className="text-[9px] text-slate-500 uppercase mt-0.5">Fat</p>
                    </div>
                  </div>

                  {/* Detected Items List - Editable */}
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                    {activeScannedItems.map((item, idx) => (
                      <div key={idx} className="flex flex-col bg-slate-800/40 hover:bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm font-semibold text-slate-100">{item.foodName}</span>
                          <button onClick={() => removeScannedItem(idx)} className="text-slate-500 hover:text-red-400 p-1 bg-slate-900/50 rounded-md"><Trash2 size={14} /></button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-slate-950/80 rounded-lg p-1 border border-slate-800">
                            <button onClick={() => updateScannedItemWeight(idx, -10)} className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"><Minus size={14} /></button>
                            <span className="text-xs font-mono font-medium w-12 text-center text-slate-200">{item.estimatedWeightGrams}g</span>
                            <button onClick={() => updateScannedItemWeight(idx, 10)} className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"><Plus size={14} /></button>
                          </div>
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                            {Math.round((item.caloriesPer100g * item.estimatedWeightGrams)/100)} kcal
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-800 mt-2">
                    <label className="label-text mb-2 block">Select Meal Time</label>
                    <div className="grid grid-cols-2 gap-2 mb-5">
                      {MEAL_TYPES.map((type) => (
                        <button key={type} type="button" onClick={() => setMealType(type)}
                          className={`py-2 rounded-lg text-xs font-bold tracking-wide capitalize border transition-all ${mealType === type ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]" : "bg-slate-900/40 border-slate-700 text-slate-400 hover:border-slate-500"}`}>
                          {type.toLowerCase()}
                        </button>
                      ))}
                    </div>
                    
                    <button type="button" disabled={submitting} onClick={handleLogScannedBatch}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]">
                      {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                      {submitting ? "Logging your gains..." : `Log ${activeScannedItems.length} items (${Math.round(totals.cals)} kcal)`}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* MANUAL LOG FORM */
            <div className="glass-card p-5 sm:p-6 h-fit">
              <h2 className="text-sm font-semibold text-slate-100 mb-4">Log a Meal</h2>
              <form onSubmit={handleLogFood} className="space-y-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1 min-w-0">
                    <FoodSearchDropdown onSelect={setSelectedFood} selectedFood={selectedFood} />
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} title="Scan food with AI"
                    className="w-[46px] h-[46px] rounded-xl bg-slate-900/60 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center transition-all group relative overflow-hidden">
                    <Camera size={20} className="group-hover:scale-110 transition-transform relative z-10" />
                    {/* Small shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                  </button>
                </div>
                
                <div>
                  <label className="label-text">Quantity (grams)</label>
                  <input type="number" min={1} required className="input-field" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>
                
                <div>
                  <label className="label-text">Meal Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {MEAL_TYPES.map((type) => (
                      <button key={type} type="button" onClick={() => setMealType(type)}
                        className={`py-2.5 rounded-xl text-xs font-semibold capitalize border transition-all ${mealType === type ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]" : "bg-slate-900/40 border-slate-700 text-slate-400"}`}>
                        {type.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Plus size={16} /> {submitting ? "Logging..." : "Log Meal"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: TODAY'S LOGS */}
        <div className="lg:col-span-3 glass-card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Utensils size={16} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-100">Today's Meals</h2>
          </div>
          {summary?.logs?.length ? (
            <div className="space-y-2">
              {summary.logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{log.foodItem.name}</p>
                    <p className="text-xs text-slate-500 capitalize mt-0.5">{log.mealType.toLowerCase()} · <span className="font-mono">{log.quantityGrams}g</span></p>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">{Math.round(log.calories)} kcal</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{Math.round(log.protein)}g protein</p>
                    </div>
                    <button onClick={() => handleDelete(log.id)} className="text-slate-500 hover:text-red-400 p-1.5 hover:bg-slate-800 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
               <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-2 border border-slate-700/50">
                  <Utensils size={24} className="text-slate-500" />
               </div>
               <p className="text-sm font-medium text-slate-300">No meals logged today</p>
               <p className="text-xs text-slate-500 max-w-[200px]">Scan a photo or search for food to start fueling your bulk!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}