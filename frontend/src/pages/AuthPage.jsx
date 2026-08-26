import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { request } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ mode }) {
  const signup = mode === "signup";
  const [form, setForm] = useState({
    name: "",
    userName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (
      (signup && (!form.name.trim() || !form.userName.trim())) ||
      !form.email.trim() ||
      !form.password
    ) {
      toast.error("Please complete all fields");
      return;
    }

    setLoading(true);
    try {
      const data = await request(signup ? "/signup" : "/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (signup) {
        toast.success(data.message);
        navigate("/signin");
      } else {
        login(data.user, data.token);
        navigate(location.state?.from?.pathname || "/home", { replace: true });
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-[calc(100vh-4rem)] place-items-center overflow-hidden px-4 py-8 sm:px-6 lg:py-12">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-coral/10 blur-3xl" />
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl shadow-stone-300/30 sm:grid sm:grid-cols-[.85fr_1.15fr]">
        <div className="hidden bg-ink p-10 text-white sm:flex sm:flex-col sm:justify-between lg:p-12">
          <div className="font-display text-3xl font-bold">
            insta<span className="text-coral">.</span>X
          </div>
          <div>
            <p className="max-w-xs font-display text-3xl font-semibold leading-tight lg:text-4xl">
              A little closer to the people and moments you love.
            </p>
            <div className="mt-8 flex items-center gap-2 text-sm text-stone-400">
              <span className="h-2 w-2 rounded-full bg-coral" />
              Share what feels real.
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-10 lg:p-14">
          <div className="mb-8 sm:hidden">
            <p className="font-display text-3xl font-bold text-ink">
              insta<span className="text-coral">.</span>X
            </p>
          </div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-coral">
            {signup ? "Join the community" : "Welcome back"}
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {signup ? "Create your account" : "Sign in to continue"}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-stone-500">
            {signup
              ? "Your people are waiting to see what you share."
              : "Pick up where your community left off."}
          </p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            {signup && (
              <>
                <div>
                  <label className="sr-only" htmlFor="name">
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    className="field"
                    placeholder="Full name"
                    autoComplete="name"
                    value={form.name}
                    onChange={updateField}
                  />
                </div>
                <div>
                  <label className="sr-only" htmlFor="userName">
                    Username
                  </label>
                  <input
                    id="userName"
                    name="userName"
                    className="field"
                    placeholder="Username"
                    autoComplete="username"
                    value={form.userName}
                    onChange={updateField}
                  />
                </div>
              </>
            )}
            <div>
              <label className="sr-only" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                className="field"
                type="email"
                placeholder="Email address"
                autoComplete="email"
                value={form.email}
                onChange={updateField}
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                className="field"
                type="password"
                placeholder="Password"
                minLength={signup ? 8 : undefined}
                autoComplete={signup ? "new-password" : "current-password"}
                value={form.password}
                onChange={updateField}
              />
              {signup && (
                <p className="mt-2 px-1 text-xs text-stone-400">
                  Use at least 8 characters for a stronger password.
                </p>
              )}
            </div>
            <button
              disabled={loading}
              className="w-full rounded-xl bg-coral px-4 py-3.5 font-semibold text-white shadow-lg shadow-coral/20 transition hover:bg-[#df4b38] focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : signup
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>
          {signup && (
            <p className="mt-5 text-center text-xs leading-5 text-stone-400">
              By creating an account, you agree to our community guidelines and
              privacy policy.
            </p>
          )}
          <p className="mt-7 text-center text-sm text-stone-500">
            {signup ? "Already have an account?" : "New to insta?"}{" "}
            <Link
              className="font-semibold text-coral hover:underline"
              to={signup ? "/signin" : "/signup"}
            >
              {signup ? "Sign in" : "Create one"}
            </Link>
          </p>
        </div>
      </div>

      {/* Copyright footer */}
  <p className="mt-6 text-center text-xs text-stone-400">
    © insta.X {new Date().getFullYear()} designed by{" "}
    <a
      href="https://sudhanshugaikwad.netlify.app"
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-coral hover:underline"
    >
      Sudhanshu Gaikwad
    </a>
  </p>
    </div>
  );
}
