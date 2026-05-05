import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { TrendingUp } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form,    setForm]    = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    const result = await signup(form.firstName, form.lastName, form.email, form.password);
    setLoading(false);
    if (result.success) navigate("/");
    else setError(result.message);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 text-white mb-2">
            <TrendingUp className="h-7 w-7 text-emerald-400" />
            <span className="text-2xl font-bold tracking-tight">StockSense</span>
          </div>
          <p className="text-sm text-white/40">Create your account</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          <h1 className="text-xl font-semibold text-white mb-1">Sign Up</h1>
          <p className="text-sm text-white/50 mb-6">Get access to the full dashboard</p>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-400/20 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/60 mb-1.5 uppercase tracking-wide">First Name</label>
                <input type="text" name="firstName" value={form.firstName} onChange={handleChange}
                  className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/50 transition-colors placeholder:text-white/30"
                  placeholder="John" required />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1.5 uppercase tracking-wide">Last Name</label>
                <input type="text" name="lastName" value={form.lastName} onChange={handleChange}
                  className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/50 transition-colors placeholder:text-white/30"
                  placeholder="Doe" required />
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/50 transition-colors placeholder:text-white/30"
                placeholder="you@email.com" required />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1.5 uppercase tracking-wide">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/50 transition-colors placeholder:text-white/30"
                placeholder="Create password" required />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1.5 uppercase tracking-wide">Confirm Password</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/50 transition-colors placeholder:text-white/30"
                placeholder="Repeat password" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-sm text-white hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-white/50">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
