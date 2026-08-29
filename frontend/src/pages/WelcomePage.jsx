import { useEffect } from "react";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Compass,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    title: "Create posts",
    description:
      "Share your daily life, moments, updates, and creativity with your community.",
    icon: Camera,
  },
  {
    title: "Follow people",
    description:
      "Stay connected with creators, friends, and people who inspire you.",
    icon: Users,
  },
  {
    title: "Send messages",
    description:
      "Chat privately and keep conversations going with your closest circle.",
    icon: MessageSquare,
  },
  {
    title: "Explore trends",
    description:
      "Discover what is happening now through trending topics and exciting content.",
    icon: TrendingUp,
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    text: "Join insta.X in a few seconds by signing up with your email and a secure password.",
  },
  {
    number: "02",
    title: "Set up your profile",
    text: "Add your name, username, bio, and a profile image to make your profile feel personal.",
  },
  {
    number: "03",
    title: "Start posting and connecting",
    text: "Share content, follow people you love, and join conversations that matter to you.",
  },
];

export default function WelcomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="relative overflow-hidden bg-slate-50 text-slate-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(251,146,60,0.14),transparent_28%)]" />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-16">
        <div className="rounded-[28px] border border-slate-200/80 bg-white/80 p-4 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:rounded-[32px] sm:p-6 lg:p-10">
          <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/insta02.png"
                alt="insta.X"
                className="h-11 w-11 rounded-2xl object-cover shadow-lg shadow-pink-500/20 ring-1 ring-pink-100"
              />
              <div>
                <p className="font-display text-2xl font-bold tracking-tight">
                  insta<span className="text-pink-500">.</span>X
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link to="/signin" className="w-full sm:w-auto">
                <Button variant="ghost" className="w-full sm:inline-flex">
                  Log In
                </Button>
              </Link>
              <Link to="/signup" className="w-full sm:w-auto">
                <Button className="w-full shadow-lg shadow-pink-500/20 sm:w-auto">
                  Sign Up
                </Button>
              </Link>
            </div>
          </header>

          <section className="grid items-center gap-8 md:gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 xl:gap-14">
            <div className="max-w-[760px]">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-pink-600 sm:mb-5 sm:text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                Welcome to insta.X
              </div>

              <h1 className="text-[2.6rem] font-black leading-[0.92] tracking-[-0.06em] text-slate-900 sm:text-[3.4rem] md:text-[4.3rem] lg:text-[5.2rem] xl:text-[7.2rem]">
                Share your world
                <span className="block">in a way that</span>
                <span className="block">feels real.</span>
              </h1>

              <p className="mt-4 max-w-[680px] text-sm leading-7 text-slate-600 sm:mt-5 sm:text-base sm:leading-8 lg:text-lg">
                insta.X is a modern social platform where people connect, create
                meaningful content, follow inspiring profiles, discover trends,
                and enjoy a cleaner, more community-focused experience.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full rounded-xl px-6 py-5 text-base font-semibold sm:w-auto sm:px-7 sm:py-6">
                    Create account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/signin" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full rounded-xl border-slate-200 px-6 py-5 text-base font-semibold sm:w-auto sm:py-6"
                  >
                    Log In
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 text-xs text-slate-600 sm:gap-x-6 sm:text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Simple signup
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Real connections
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Secure community
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[480px] sm:max-w-[500px] lg:max-w-[530px]">
              <div className="absolute -left-8 top-8 h-24 w-24 rounded-full bg-pink-200/60 blur-3xl sm:h-28 sm:w-28 md:h-32 md:w-32" />
              <div className="absolute -right-6 bottom-8 h-24 w-24 rounded-full bg-orange-200/60 blur-3xl sm:h-28 sm:w-28 md:h-32 md:w-32" />

              <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 p-3 text-white shadow-[0_35px_80px_-32px_rgba(15,23,42,0.8)] sm:rounded-[30px] sm:p-4 lg:min-h-[460px] xl:min-h-[520px]">
                <div className="h-full rounded-[22px] bg-gradient-to-br from-slate-900 via-slate-800 to-pink-900 p-4 sm:p-5 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-400 text-sm font-bold text-white">
                        SG
                      </div>
                      <div>
                        <p className="font-semibold">Sudhanshu</p>
                        <p className="text-xs text-slate-300">@sudhanshu</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-pink-500/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-pink-200">
                      Live
                    </span>
                  </div>

                  <div className="mt-5 rounded-2xl bg-white/5 p-3 backdrop-blur-sm sm:mt-6 sm:p-4">
                    <div className="mb-3 flex items-center gap-2 text-pink-200">
                      <Compass className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-[0.2em]">
                        Trending
                      </span>
                    </div>
                    <div className="space-y-3 text-sm text-slate-200">
                      <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                        <span>#Design</span>
                        <span className="text-pink-300">12k</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                        <span>#Creator</span>
                        <span className="text-pink-300">8.4k</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                        <span>#Travel</span>
                        <span className="text-pink-300">6.2k</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-white/5 p-3">
                      <div className="text-xl font-bold text-pink-300">12K</div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
                        Posts
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3">
                      <div className="text-xl font-bold text-pink-300">
                        3.1K
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
                        Followers
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3">
                      <div className="text-xl font-bold text-pink-300">480</div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
                        Messages
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-14 sm:mt-20">
          <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pink-500 sm:text-xs">
              Why insta.X
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Built for connection, creativity, and discovery.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_15px_35px_-18px_rgba(15,23,42,0.25)] transition duration-300 hover:-translate-y-1 hover:border-pink-200 hover:shadow-[0_20px_45px_-18px_rgba(244,114,182,0.35)]"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_15px_40px_-18px_rgba(15,23,42,0.2)] sm:mt-20 sm:rounded-[32px] sm:p-6 lg:p-10">
          <div className="mb-8 text-center sm:mb-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pink-500 sm:text-xs">
              How it works
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Get started in three easy steps
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {steps.map(({ number, title, text }) => (
              <div
                key={number}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-sm font-bold text-white">
                  {number}
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 sm:mt-20">
          <div className="rounded-[24px] bg-slate-900 px-4 py-6 text-white shadow-[0_30px_80px_-25px_rgba(15,23,42,0.7)] sm:rounded-[32px] sm:px-8 sm:py-8 lg:px-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <img
                    src="/insta02.png"
                    alt="insta.X logo"
                    className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/15"
                  />
                  <div className="font-display text-2xl font-bold tracking-tight text-white">
                    insta<span className="text-pink-400">.</span>X
                  </div>
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-pink-300 sm:text-xs">
                  Join now
                </p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  Start creating, following, and connecting today.
                </h2>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    Sign Up
                  </Button>
                </Link>
                <Link to="/signin" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-white/30 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
                  >
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
