import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-800/40 bg-ink-900 text-white">
      <div className="container-narrow flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-cta transition group-hover:scale-105">
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
          <span className="font-display text-xl font-extrabold tracking-tightish text-white">
            GetPDFTool
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 font-medium text-white/85 transition hover:text-white"
          >
            Editor
          </Link>
          <Link
            href="/organise"
            className="rounded-lg px-3 py-2 font-medium text-white/85 transition hover:text-white"
          >
            Organise
          </Link>
          <Link
            href="/about"
            className="hidden rounded-lg px-3 py-2 font-medium text-white/85 transition hover:text-white sm:inline-flex"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="hidden rounded-lg px-3 py-2 font-medium text-white/85 transition hover:text-white sm:inline-flex"
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
