import React from "react";
import { Flame, TrendingUp } from "lucide-react";

export default function CalorieProgressBar({ consumed = 0, goal = 1, surplusOrDeficit = 0, goalMet = false }) {
  const percent = Math.min(100, Math.max(0, (consumed / goal) * 100));
  const barColor = goalMet ? "bg-emerald-500" : percent > 75 ? "bg-emerald-500/80" : "bg-slate-500";

  return (
    <div className="glass-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
              goalMet ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-700/40 text-slate-300"
            }`}
          >
            <Flame size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">Today's Calorie Surplus Goal</p>
            <p className="text-xs text-slate-500">
              {Math.round(consumed).toLocaleString()} / {Math.round(goal).toLocaleString()} kcal
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full transition-all duration-300 ${
            surplusOrDeficit >= 0
              ? "text-emerald-400 bg-emerald-500/10"
              : "text-red-400 bg-red-500/10"
          }`}
        >
          <TrendingUp size={14} className={surplusOrDeficit < 0 ? "rotate-180" : ""} />
          {surplusOrDeficit >= 0 ? "+" : ""}
          {Math.round(surplusOrDeficit)} kcal
        </div>
      </div>

      <div className="w-full h-3 bg-slate-900/70 rounded-full overflow-hidden border border-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-xs text-slate-500">0 kcal</span>
        <span className={`text-xs font-medium ${goalMet ? "text-emerald-400" : "text-slate-500"}`}>
          {goalMet ? "Surplus hit — great work 💪" : `${Math.round(percent)}% of goal`}
        </span>
      </div>
    </div>
  );
}
