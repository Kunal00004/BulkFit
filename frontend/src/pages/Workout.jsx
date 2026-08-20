import React, { useEffect, useState } from "react";
import { Plus, Minus, Dumbbell, Trash2, ChevronDown } from "lucide-react";
import { workoutApi } from "../api/services";

let rowIdCounter = 0;
const newRow = (reps = 10) => ({ _id: rowIdCounter++, reps });

function ExerciseSelect({ exercises, selected, onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <label className="label-text">Exercise</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input-field flex items-center justify-between text-left"
      >
        <span className={selected ? "text-slate-100" : "text-slate-500"}>
          {selected ? `${selected.name} — ${selected.targetMuscle}` : "Select an exercise..."}
        </span>
        <ChevronDown size={16} className={`text-slate-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full glass-card p-2 max-h-72 overflow-y-auto animate-fade-in bg-slate-800/95">
          {exercises.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => {
                onSelect(ex);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-emerald-500/10 transition-all duration-200 text-left"
            >
              <div>
                <p className="text-sm text-slate-200">{ex.name}</p>
                <p className="text-xs text-slate-500">{ex.targetMuscle}</p>
              </div>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                  ex.difficultyLevel === "BEGINNER"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : ex.difficultyLevel === "INTERMEDIATE"
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {ex.difficultyLevel}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WorkoutPage() {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [rows, setRows] = useState([newRow(), newRow()]);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = async () => {
    const [{ data: exerciseList }, { data: recent }] = await Promise.all([
      workoutApi.getExercises(),
      workoutApi.getRecent(8),
    ]);
    setExercises(exerciseList);
    setRecentWorkouts(recent);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    })();
  }, []);

  const addRow = () => setRows((r) => [...r, newRow(r[r.length - 1]?.reps ?? 10)]);
  const removeRow = (id) => setRows((r) => (r.length > 1 ? r.filter((row) => row._id !== id) : r));
  const updateReps = (id, reps) =>
    setRows((r) => r.map((row) => (row._id === id ? { ...row, reps } : row)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!selectedExercise) {
      setError("Please select an exercise first");
      return;
    }
    if (rows.some((r) => !r.reps || r.reps <= 0)) {
      setError("All rows need a valid rep count");
      return;
    }

    setSubmitting(true);
    try {
      const payload = rows.map((r) => ({
        exerciseId: selectedExercise.id,
        sets: 1,
        reps: Number(r.reps),
      }));
      await workoutApi.logWorkoutBatch(payload);
      setSuccessMsg(`Logged ${rows.length} set${rows.length > 1 ? "s" : ""} of ${selectedExercise.name}!`);
      setRows([newRow(), newRow()]);
      setSelectedExercise(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to log workout");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    await workoutApi.deleteLog(id);
    await loadData();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-slate-500 animate-pulse">Loading workout data...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Workout Logger</h1>
        <p className="text-slate-500 text-sm mt-1">Progressive overload, no equipment needed.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Log form */}
        <div className="lg:col-span-2 glass-card p-5 sm:p-6 h-fit">
          <h2 className="text-sm font-semibold text-slate-100 mb-4">Log a Session</h2>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs animate-fade-in">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <ExerciseSelect exercises={exercises} selected={selectedExercise} onSelect={setSelectedExercise} />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label-text mb-0">Sets & Reps</label>
                <span className="text-xs text-slate-500">{rows.length} set{rows.length > 1 ? "s" : ""}</span>
              </div>

              <div className="space-y-2">
                {rows.map((row, idx) => (
                  <div key={row._id} className="flex items-center gap-2 animate-fade-in">
                    <div className="w-9 h-9 rounded-lg bg-slate-800/60 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-400 flex-shrink-0">
                      {idx + 1}
                    </div>
                    <input
                      type="number"
                      min={1}
                      required
                      placeholder="Reps"
                      className="input-field flex-1"
                      value={row.reps}
                      onChange={(e) => updateReps(row._id, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(row._id)}
                      disabled={rows.length === 1}
                      className="w-9 h-9 rounded-lg bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <Minus size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addRow}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:border-emerald-500/40 hover:text-emerald-400 transition-all duration-300 text-sm font-medium"
              >
                <Plus size={15} />
                Add Set
              </button>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
              <Dumbbell size={16} />
              {submitting ? "Logging..." : "Log Workout"}
            </button>
          </form>
        </div>

        {/* Recent workouts */}
        <div className="lg:col-span-3 glass-card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell size={16} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-100">Recent Sessions</h2>
          </div>

          {recentWorkouts.length ? (
            <div className="space-y-2">
              {recentWorkouts.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all duration-300"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-200">{log.exercise.name}</p>
                    <p className="text-xs text-slate-500">
                      {log.exercise.targetMuscle} · {log.logDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-semibold text-slate-300">
                      {log.sets} × {log.reps}
                    </p>
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
            <p className="text-sm text-slate-500 py-8 text-center">No workouts logged yet. Time to move!</p>
          )}
        </div>
      </div>
    </div>
  );
}
