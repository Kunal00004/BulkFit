import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Utensils, Dumbbell, LogOut, Flame } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/diet", label: "Diet Logger", icon: Utensils },
  { to: "/workout", label: "Workout Logger", icon: Dumbbell },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen border-r border-slate-800 bg-slate-900/60 backdrop-blur-md px-4 py-6 sticky top-0">
        <div className="flex items-center gap-2 px-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-glow">
            <Flame className="w-5 h-5 text-slate-900" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight">BulkFit</span>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent"
                }`
              }
            >
              <Icon className="w-4.5 h-4.5" size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 pt-4 mt-4">
          <div className="px-2 mb-3">
            <p className="text-sm font-semibold text-slate-100 truncate">{user?.fullName}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-crimson-400 text-red-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex justify-around py-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all duration-300 ${
                isActive ? "text-emerald-400" : "text-slate-500"
              }`
            }
          >
            <Icon size={20} />
            {label.split(" ")[0]}
          </NavLink>
        ))}
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 px-3 py-1.5 text-xs text-slate-500">
          <LogOut size={20} />
          Exit
        </button>
      </nav>
    </>
  );
}
