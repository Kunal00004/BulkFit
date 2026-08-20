import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Mail, Lock, User as UserIcon, Ruler, Weight, Target, Cake, Eye, EyeOff, Check, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const initialRegisterState = {
  fullName: "",
  email: "",
  password: "",
  age: 22,
  heightCm: 170,
  currentWeightKg: 53,
  targetWeightKg: 65,
};

function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "1 number", pass: /\d/.test(password) },
    { label: "1 uppercase letter", pass: /[A-Z]/.test(password) },
  ];
  if (!password) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {checks.map((c) => (
        <span
          key={c.label}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-all duration-300 ${
            c.pass
              ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
              : "text-slate-500 border-slate-700 bg-slate-800/40"
          }`}
        >
          {c.pass ? <Check size={12} /> : <X size={12} />}
          {c.label}
        </span>
      ))}
    </div>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState(initialRegisterState);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(loginForm);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(registerForm);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.details?.[0] || err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const isRegisterValid =
    registerForm.fullName.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(registerForm.email) &&
    registerForm.password.length >= 8;

  return (
    <div className="min-h-screen flex bg-base">
      {/* Left: motivational panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "radial-gradient(circle, #10B981 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-glow">
              <Flame className="w-5 h-5 text-slate-900" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight">BulkFit</span>
          </div>

          <div className="space-y-6 animate-fade-in">
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">
              Home-Based Hypertrophy
            </p>
            <h1 className="text-5xl xl:text-6xl font-extrabold leading-[1.05] tracking-tight">
              From 53kg
              <br />
              to your{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                strongest self.
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              No gym required. Track your caloric surplus, log progressive overload sets,
              and watch your weight progression climb — one rep, one meal at a time.
            </p>
          </div>

          <div className="flex gap-8 text-sm text-slate-500">
            <div>
              <p className="text-2xl font-bold text-slate-100">2g/kg</p>
              <p>Protein target</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">+400</p>
              <p>Daily kcal surplus</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">0</p>
              <p>Equipment needed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Flame className="w-5 h-5 text-slate-900" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold">BulkFit</span>
          </div>

          <div className="glass-card p-6 sm:p-8 animate-fade-in">
            <div className="flex mb-6 bg-slate-900/60 rounded-xl p-1 border border-slate-800">
              <button
                onClick={() => { setMode("login"); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  mode === "login" ? "bg-emerald-500 text-slate-900" : "text-slate-400"
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => { setMode("register"); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  mode === "register" ? "bg-emerald-500 text-slate-900" : "text-slate-400"
                }`}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
                {error}
              </div>
            )}

            {mode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label-text">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="email"
                      required
                      className="input-field pl-10"
                      placeholder="you@example.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="label-text">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className="input-field pl-10 pr-10"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
                  {submitting ? "Logging in..." : "Log In"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="label-text">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      required
                      className="input-field pl-10"
                      placeholder="Arjun Sharma"
                      value={registerForm.fullName}
                      onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="label-text">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="email"
                      required
                      className="input-field pl-10"
                      placeholder="you@example.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="label-text">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className="input-field pl-10 pr-10"
                      placeholder="Min. 8 characters"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <PasswordStrength password={registerForm.password} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-text">Age</label>
                    <div className="relative">
                      <Cake className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input
                        type="number"
                        required
                        min={13}
                        max={100}
                        className="input-field pl-10"
                        value={registerForm.age}
                        onChange={(e) => setRegisterForm({ ...registerForm, age: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label-text">Height (cm)</label>
                    <div className="relative">
                      <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input
                        type="number"
                        required
                        className="input-field pl-10"
                        value={registerForm.heightCm}
                        onChange={(e) => setRegisterForm({ ...registerForm, heightCm: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label-text">Current Weight (kg)</label>
                    <div className="relative">
                      <Weight className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input
                        type="number"
                        required
                        className="input-field pl-10"
                        value={registerForm.currentWeightKg}
                        onChange={(e) => setRegisterForm({ ...registerForm, currentWeightKg: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label-text">Target Weight (kg)</label>
                    <div className="relative">
                      <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input
                        type="number"
                        required
                        className="input-field pl-10"
                        value={registerForm.targetWeightKg}
                        onChange={(e) => setRegisterForm({ ...registerForm, targetWeightKg: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !isRegisterValid}
                  className="btn-primary w-full mt-2"
                >
                  {submitting ? "Creating account..." : "Start Bulking"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
