import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 bg-ink-900 text-white">
      <div className="container-narrow grid gap-10 py-12 md:grid-cols-12">
        {/* Trust badge */}
        <div className="md:col-span-3">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-brand-600 text-white shadow-cta">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">
                Trusted by thousands
                <br />
                of users worldwide
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 text-sm text-white/85">
            <span aria-hidden="true" className="text-yellow-400">
              ★★★★★
            </span>
            <span>4.9/5 based on user feedback</span>
          </div>
        </div>

        {/* Product */}
        <div className="md:col-span-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">
            Product
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/75">
            <li>
              <Link
                href="/"
                className="transition hover:text-brand-400"
              >
                Editor
              </Link>
            </li>
            <li>
              <Link
                href="/organise"
                className="transition hover:text-brand-400"
              >
                Organise
              </Link>
            </li>
            <li>
              <Link
                href="/sign-pdf"
                className="transition hover:text-brand-400"
              >
                Sign PDF
              </Link>
            </li>
            <li>
              <Link
                href="/compress-pdf"
                className="transition hover:text-brand-400"
              >
                Compress PDF
              </Link>
            </li>
            <li>
              <Link
                href="/merge-pdf"
                className="transition hover:text-brand-400"
              >
                Merge PDF
              </Link>
            </li>
          </ul>
        </div>

        {/* Convert */}
        <div className="md:col-span-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">
            Convert
          </h4>
          <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 text-sm text-white/75">
            <li>
              <Link
                href="/pdf-to-word"
                className="transition hover:text-brand-400"
              >
                PDF → Word
              </Link>
            </li>
            <li>
              <Link
                href="/word-to-pdf"
                className="transition hover:text-brand-400"
              >
                Word → PDF
              </Link>
            </li>
            <li>
              <Link
                href="/pdf-to-excel"
                className="transition hover:text-brand-400"
              >
                PDF → Excel
              </Link>
            </li>
            <li>
              <Link
                href="/excel-to-pdf"
                className="transition hover:text-brand-400"
              >
                Excel → PDF
              </Link>
            </li>
            <li>
              <Link
                href="/pdf-to-powerpoint"
                className="transition hover:text-brand-400"
              >
                PDF → PPT
              </Link>
            </li>
            <li>
              <Link
                href="/jpeg-to-pdf"
                className="transition hover:text-brand-400"
              >
                JPEG → PDF
              </Link>
            </li>
            <li>
              <Link
                href="/pdf-to-jpg"
                className="transition hover:text-brand-400"
              >
                PDF → JPG
              </Link>
            </li>
            <li>
              <Link
                href="/html-to-pdf"
                className="transition hover:text-brand-400"
              >
                HTML → PDF
              </Link>
            </li>
          </ul>
        </div>

        {/* Email signup + socials */}
        <div className="md:col-span-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">
            Stay updated
          </h4>
          <p className="mt-2 text-sm text-white/70">
            Get tips, product updates, and more.
          </p>
          <NewsletterForm />

          <div className="mt-6 flex items-center gap-3">
            <SocialIcon
              href="https://x.com/"
              label="X / Twitter"
              path="M14.094 9.94L20.32 3h-1.475l-5.405 6.026L9.124 3H4.125l6.529 9.219L4.125 20h1.475l5.71-6.367L15.875 20h4.999l-6.78-10.06zM6.193 4.06h2.27L18.806 18.94h-2.27L6.193 4.061z"
            />
            <SocialIcon
              href="https://facebook.com/"
              label="Facebook"
              path="M22 12.06c0-5.52-4.48-10-10-10S2 6.54 2 12.06c0 4.93 3.66 9.02 8.44 9.78v-6.92H7.9v-2.86h2.54V9.85c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.86h-2.33v6.92C18.34 21.07 22 17 22 12.06z"
            />
            <SocialIcon
              href="https://instagram.com/"
              label="Instagram"
              path="M12 2c-2.72 0-3.06.01-4.12.06C6.81 2.11 6.07 2.27 5.42 2.5a4.92 4.92 0 0 0-1.78 1.16 4.92 4.92 0 0 0-1.16 1.78c-.23.65-.39 1.39-.44 2.46C2.01 8.94 2 9.28 2 12s.01 3.06.06 4.12c.05 1.07.21 1.81.44 2.46a4.92 4.92 0 0 0 1.16 1.78c.55.55 1.13.91 1.78 1.16.65.23 1.39.39 2.46.44C8.94 21.99 9.28 22 12 22s3.06-.01 4.12-.06c1.07-.05 1.81-.21 2.46-.44a4.92 4.92 0 0 0 1.78-1.16 4.92 4.92 0 0 0 1.16-1.78c.23-.65.39-1.39.44-2.46.05-1.06.06-1.4.06-4.12s-.01-3.06-.06-4.12c-.05-1.07-.21-1.81-.44-2.46a4.92 4.92 0 0 0-1.16-1.78 4.92 4.92 0 0 0-1.78-1.16c-.65-.23-1.39-.39-2.46-.44C15.06 2.01 14.72 2 12 2zm0 1.8c2.67 0 2.99.01 4.04.06.97.04 1.5.21 1.85.34.46.18.8.4 1.15.74.34.34.56.69.74 1.15.13.35.3.88.34 1.85.05 1.05.06 1.37.06 4.04s-.01 2.99-.06 4.04c-.04.97-.21 1.5-.34 1.85a3.1 3.1 0 0 1-.74 1.15c-.34.34-.69.56-1.15.74-.35.13-.88.3-1.85.34-1.05.05-1.37.06-4.04.06s-2.99-.01-4.04-.06c-.97-.04-1.5-.21-1.85-.34a3.1 3.1 0 0 1-1.15-.74 3.1 3.1 0 0 1-.74-1.15c-.13-.35-.3-.88-.34-1.85-.05-1.05-.06-1.37-.06-4.04s.01-2.99.06-4.04c.04-.97.21-1.5.34-1.85.18-.46.4-.8.74-1.15.34-.34.69-.56 1.15-.74.35-.13.88-.3 1.85-.34 1.05-.05 1.37-.06 4.04-.06zm0 3.06A5.14 5.14 0 1 0 17.14 12 5.14 5.14 0 0 0 12 6.86zm0 8.48A3.34 3.34 0 1 1 15.34 12 3.34 3.34 0 0 1 12 15.34zm5.34-9.86a1.2 1.2 0 1 0 1.2 1.2 1.2 1.2 0 0 0-1.2-1.2z"
            />
            <SocialIcon
              href="https://youtube.com/"
              label="YouTube"
              path="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-narrow flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/60 sm:flex-row">
          <p>© {year} GetPDFTool. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link
              href="/about"
              className="transition hover:text-white"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="transition hover:text-white"
            >
              Contact
            </Link>
            <Link
              href="/privacy"
              className="transition hover:text-white"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="transition hover:text-white"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  path,
}: {
  href: string;
  label: string;
  path: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 bg-white/5 text-white/70 transition hover:border-brand-500 hover:bg-brand-500/10 hover:text-white"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d={path} />
      </svg>
    </a>
  );
}
