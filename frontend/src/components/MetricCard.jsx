import React from "react";

const colorMap = {
  emerald: {
    icon: "text-emerald-400 bg-emerald-500/10",
    ring: "hover:shadow-glow hover:border-emerald-500/40",
  },
  crimson: {
    icon: "text-red-400 bg-red-500/10",
    ring: "hover:shadow-glowRed hover:border-red-500/40",
  },
  slate: {
    icon: "text-slate-300 bg-slate-700/40",
    ring: "hover:border-slate-600",
  },
};

export default function MetricCard({ icon: Icon, label, value, unit, sublabel, tone = "slate" }) {
  const styles = colorMap[tone] || colorMap.slate;

  return (
    <div className={`glass-card p-5 sm:p-6 ${styles.ring}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="label-text">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-50 tracking-tight">{value}</span>
            {unit && <span className="text-sm text-slate-400 font-medium">{unit}</span>}
          </div>
          {sublabel && <p className="text-xs text-slate-500 mt-1.5">{sublabel}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${styles.icon}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
