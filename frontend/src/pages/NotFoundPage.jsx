import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="relative grid min-h-[calc(100vh-4rem)] place-items-center overflow-hidden px-5 py-12 sm:px-8">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-coral/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />

      <div className="relative w-full max-w-xl text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-ink text-white shadow-xl shadow-stone-300/40 sm:h-24 sm:w-24">
          <span className="font-display text-2xl font-bold sm:text-3xl">inta<span className="text-coral">.</span>X</span>
        </div>
        <p className="mt-8 text-xs font-bold uppercase tracking-[.28em] text-coral">Lost in the feed</p>
        <p className="mt-3 font-display text-7xl font-bold tracking-tight text-ink sm:text-9xl">404</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">This page slipped away.</h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-stone-500 sm:text-base">
          The link may be outdated, or this moment may not exist anymore.
        </p>
        <Link
          to="/home"
          className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-coral px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-coral/20 transition hover:bg-[#df4b38] focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 sm:w-auto"
        >
          Return to your feed
        </Link>
      </div>
    </div>
  );
}
