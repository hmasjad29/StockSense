import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Eye, EyeOff, TrendingUp } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form,         setForm]         = useState({ email: "", password: "" });
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) navigate("/");
    else setError(result.message);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 text-white mb-2">
            <TrendingUp className="h-7 w-7 text-emerald-400" />
            <span className="text-2xl font-bold tracking-tight">StockSense</span>
          </div>
          <p className="text-sm text-white/40">Smart Stock Trend Prediction Platform</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          <h1 className="text-xl font-semibold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-white/50 mb-6">Sign in to your dashboard</p>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-400/20 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-white/60 mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/50 transition-colors placeholder:text-white/30"
                placeholder="you@email.com" required
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} name="password" value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 pr-12 text-white text-sm outline-none focus:border-emerald-500/50 transition-colors placeholder:text-white/30"
                  placeholder="••••••••" required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-sm text-white hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-white/50">
            No account?{" "}
            <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
