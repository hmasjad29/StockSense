import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login(form.email, form.password);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.message);
    }
  };
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        <h1 className="text-2xl font-semibold text-white mb-2">Login</h1>
        <p className="text-sm text-white/60 mb-6">Access your StockSense dashboard</p>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-400/20 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white outline-none"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 pr-12 text-white outline-none"
                  placeholder="Enter your password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-medium text-white hover:bg-emerald-400"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-sm text-white/60">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-emerald-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}