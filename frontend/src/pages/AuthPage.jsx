import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  signup as signupApi,
  signin as signinApi,
  checkUsernameAvailability,
} from "../lib/api";
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
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState({
    checking: false,
    available: null,
    message: "",
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!signup) {
      setUsernameStatus({ checking: false, available: null, message: "" });
      return undefined;
    }

    const username = form.userName.trim();
    if (!username) {
      setUsernameStatus({ checking: false, available: null, message: "" });
      return undefined;
    }

    if (username.length < 3 || !/^[a-zA-Z0-9._]+$/.test(username)) {
      setUsernameStatus({
        checking: false,
        available: false,
        message: "Use 3+ characters with letters, numbers, dots, or underscores only",
      });
      return undefined;
    }

    let cancelled = false;
    setUsernameStatus({ checking: true, available: null, message: "Checking username..." });

    const timer = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(username);
        if (!cancelled) {
          setUsernameStatus({
            checking: false,
            available: result.available,
            message: result.message,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setUsernameStatus({
            checking: false,
            available: false,
            message: error.message,
          });
        }
      }
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.userName, signup]);

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

    if (signup && usernameStatus.available === false) {
      toast.error("Please choose a different username.");
      return;
    }

    setLoading(true);

    try {
      let data;

      if (signup) {
        data = await signupApi(
          form.name.trim(),
          form.userName.trim(),
          form.email.trim(),
          form.password
        );
        toast.success(data.message);
        navigate("/signin");
      } else {
        data = await signinApi(form.email.trim(), form.password);
        login(data.user, data.token);
        navigate(location.state?.from?.pathname || "/home", {
          replace: true,
        });
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
        <div className="hidden bg-gradient-to-br from-[#1f1d1b] via-[#161514] to-[#1d1a18] p-10 text-white sm:flex sm:flex-col sm:justify-between lg:p-12">
          <div className="flex items-center gap-3">
            <img
              src="/insta02.png"
              alt="insta.X logo"
              className="h-14 w-14 rounded-2xl border border-white/10 bg-white/5 object-cover shadow-lg shadow-black/20"
            />
            <div className="font-display text-3xl font-bold tracking-tight">
              insta<span className="text-coral">.</span>X
            </div>
          </div>
          <div>
            <p className="max-w-xs font-display text-3xl font-semibold leading-tight lg:text-4xl">
              A little closer to the people and moments you love.
            </p>
            <div className="mt-8 flex items-center gap-2 text-sm text-stone-300">
              <span className="h-2.5 w-2.5 rounded-full bg-coral shadow-[0_0_12px_rgba(248,110,90,0.8)]" />
              Share what feels real.
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-10 lg:p-14">
          <div className="mb-8 flex items-center gap-3 sm:hidden">
            <img
              src="/insta02.png"
              alt="insta.X logo"
              className="h-11 w-11 rounded-2xl border border-stone-200 bg-stone-50 object-cover"
            />
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
                  {form.userName.trim() && (
                    <p
                      className={`mt-2 text-xs ${
                        usernameStatus.available === false
                          ? "text-red-500"
                          : usernameStatus.available === true
                            ? "text-emerald-600"
                            : "text-stone-400"
                      }`}
                    >
                      {usernameStatus.checking ? "Checking username..." : usernameStatus.message}
                    </p>
                  )}
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
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  className="field pr-11"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  minLength={signup ? 8 : undefined}
                  autoComplete={signup ? "new-password" : "current-password"}
                  value={form.password}
                  onChange={updateField}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-3 flex items-center text-stone-400 transition hover:text-stone-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {signup && (
                <p className="mt-2 px-1 text-xs text-stone-400">
                  Use at least 8 characters for a stronger password.
                </p>
              )}
            </div>
            <button
              disabled={loading || (signup && (usernameStatus.checking || usernameStatus.available === false))}
              className="w-full rounded-xl bg-gradient-to-r from-[#f16c57] via-[#ee5c47] to-[#e6533d] px-4 py-3.5 font-semibold text-white shadow-lg shadow-[#ee5c47]/25 transition duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#ee5c47] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
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

          {!signup && (
            <div className="mt-5 border-t border-stone-200 pt-4 text-center text-sm text-stone-500">
              Need admin access?{" "}
              <Link className="font-semibold text-coral hover:underline" to="/admin">
                Admin sign in
              </Link>
            </div>
          )}
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
