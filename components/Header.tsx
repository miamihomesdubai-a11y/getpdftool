"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  /**
   * The home page IS the editor (route "/"), so clicking a Link to
   * "/" while already on "/" is a no-op from Next.js's perspective —
   * which felt like the button was broken. When the user is already on
   * the home page, force a hard reload instead: it clears any PDF the
   * user has loaded into the editor and scrolls back to the top, which
   * is what "Home" should feel like.
   */
  const onHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.location.href = "/";
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-800/40 bg-ink-900 text-white">
      <div className="container-narrow flex h-16 items-center justify-between">
        {/* Logo — clickable from every page; takes the user back to
            the homepage (which is also the main editor). Hover effect
            on the wrapper makes it visually obvious it's a link. */}
        <Link
          href="/"
          onClick={onHomeClick}
          title="GetPDFTool — back to home"
          aria-label="Go to GetPDFTool home page"
          className="group flex items-center gap-2.5 rounded-xl px-1 py-1 transition hover:bg-white/5"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-cta transition group-hover:scale-105 group-hover:shadow-pop">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm-1 7V3.5L18.5 9H13Z" />
            </svg>
          </span>
          <span className="font-display text-xl font-extrabold tracking-tightish text-white transition group-hover:text-brand-200">
            GetPDFTool
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {/* Renamed Editor → Home so it's universally understood as
              "back to the landing page", even though the editor lives
              there. Same onClick as the logo: hard-reload when already
              on / so the editor resets to a clean state. */}
          <Link
            href="/"
            onClick={onHomeClick}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-medium text-white/85 transition hover:bg-white/5 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M3 9 12 2l9 7v11a2 2 0 0 1-2 2h-4v-7H10v7H6a2 2 0 0 1-2-2V9z" />
            </svg>
            Home
          </Link>
          <Link
            href="/organise"
            className="rounded-lg px-3 py-2 font-medium text-white/85 transition hover:bg-white/5 hover:text-white"
          >
            Organise
          </Link>
          <Link
            href="/about"
            className="hidden rounded-lg px-3 py-2 font-medium text-white/85 transition hover:bg-white/5 hover:text-white sm:inline-flex"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="hidden rounded-lg px-3 py-2 font-medium text-white/85 transition hover:bg-white/5 hover:text-white sm:inline-flex"
          >
            Contact
          </Link>
          <Link
            href="/contact"
            className="ml-2 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-cta ring-1 ring-brand-700/30 transition hover:-translate-y-0.5 hover:bg-brand-700"
          >
            <span aria-hidden="true">👑</span> Premium
          </Link>
        </nav>
      </div>
    </header>
  );
}
