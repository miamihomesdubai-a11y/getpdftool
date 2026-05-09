"use client";

import { useState } from "react";

/**
 * Email signup form for the footer.
 * Currently a no-op (the input is captured client-side and acknowledged).
 * Wire to Mailchimp / Beehiiv / a Vercel function whenever you pick a provider.
 */
export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
  };

  if (submitted) {
    return (
      <p className="mt-4 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white/85">
        ✓ Thanks! We'll be in touch.
      </p>
    );
  }

  return (
    <form className="mt-4 flex items-center gap-2" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="newsletter-email">
        Your email
      </label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/50 outline-none ring-0 transition focus:border-brand-400 focus:bg-white/15"
      />
      <button
        type="submit"
        aria-label="Subscribe"
        className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-brand-600 text-white shadow-cta transition hover:bg-brand-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
        </svg>
      </button>
    </form>
  );
}
