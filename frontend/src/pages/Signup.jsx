import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (form.password !== form.confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  const result = await signup(form.name, form.email, form.password);

  if (result.success) {
    navigate("/");
  } else {
    setError(result.message);
  }
};

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        <h1 className="text-2xl font-semibold text-white mb-2">Sign Up</h1>
        <p className="text-sm text-white/60 mb-6">Create your StockSense account</p>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-400/20 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white outline-none"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white outline-none"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white outline-none"
              placeholder="Create password"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white outline-none"
              placeholder="Confirm password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-medium text-white hover:bg-emerald-400"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-sm text-white/60">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}