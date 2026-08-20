import React, { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Weight, Target, Flame, Utensils, Dumbbell, TrendingUp } from "lucide-react";
import { dashboardApi } from "../api/services";
import { useAuth } from "../context/AuthContext.jsx";
import MetricCard from "../components/MetricCard.jsx";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 border border-slate-700 rounded-xl px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-emerald-400">{payload[0].value} kg</p>
    </div>
  );
}

function MealRow({ log }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-200">{log.foodItem?.name}</p>
        <p className="text-xs text-slate-500 capitalize">
          {log.mealType?.toLowerCase()} · {log.quantityGrams}g
        </p>
      </div>
      <p className="text-sm font-semibold text-emerald-400">{Math.round(log.calories)} kcal</p>
    </div>
  );
}

function WorkoutRow({ log }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-200">{log.exercise?.name}</p>
        <p className="text-xs text-slate-500">{log.exercise?.targetMuscle}</p>
      </div>
      <p className="text-sm font-semibold text-slate-300">
        {log.sets} × {log.reps}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data: dashboard } = await dashboardApi.getDashboard();
        setData(dashboard);
      } catch (err) {
        setError("Couldn't load your dashboard. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-500 animate-pulse">Loading your progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 text-red-400 text-sm">{error}</div>
    );
  }

  const goalStatusValue = data.todayGoalMet ? "Surplus Hit" : `${Math.round((data.todayCaloriesConsumed / data.todayCalorieGoal) * 100)}%`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back, {user?.fullName?.split(" ")[0]}
        </h1>
        <p className="text-slate-500 text-sm mt-1">Here's your bulk progress at a glance.</p>
      </div>

      {/* Top row: 3 metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={Weight}
          label="Current Weight"
          value={data.currentWeightKg}
          unit="kg"
          sublabel={`${data.weightToGoKg > 0 ? "+" : ""}${data.weightToGoKg}kg to target`}
          tone="slate"
        />
        <MetricCard
          icon={Target}
          label="Target Weight"
          value={data.targetWeightKg}
          unit="kg"
          sublabel="Lean bulk goal"
          tone="emerald"
        />
        <MetricCard
          icon={Flame}
          label="Today's Calorie Goal"
          value={goalStatusValue}
          sublabel={`${Math.round(data.todayCaloriesConsumed)} / ${Math.round(data.todayCalorieGoal)} kcal`}
          tone={data.todayGoalMet ? "emerald" : "crimson"}
        />
      </div>

      {/* Middle row: weight progression chart */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Weight Progression</h2>
            <p className="text-xs text-slate-500">Last 30 days</p>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
            <TrendingUp size={16} />
            Trending up
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data.weightProgression} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#64748B", fontSize: 11 }}
              tickFormatter={(d) => d.slice(5)}
              axisLine={{ stroke: "#1E293B" }}
              tickLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fill: "#64748B", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={["dataMin - 1", "dataMax + 1"]}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="weightKg"
              stroke="#10B981"
              strokeWidth={2.5}
              fill="url(#weightGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row: recent meals & workouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Utensils size={16} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-100">Recent Meals</h2>
          </div>
          {data.recentMeals?.length ? (
            data.recentMeals.map((log) => <MealRow key={log.id} log={log} />)
          ) : (
            <p className="text-sm text-slate-500 py-4 text-center">No meals logged yet.</p>
          )}
        </div>

        <div className="glass-card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell size={16} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-100">Recent Workouts</h2>
          </div>
          {data.recentWorkouts?.length ? (
            data.recentWorkouts.map((log) => <WorkoutRow key={log.id} log={log} />)
          ) : (
            <p className="text-sm text-slate-500 py-4 text-center">No workouts logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
