import dynamic from "next/dynamic";
import AdSlot from "@/components/AdSlot";
import RelatedTools from "@/components/RelatedTools";
import ConvertFromTools from "@/components/ConvertFromTools";
import ConvertToTools from "@/components/ConvertToTools";

// PDF editor uses browser-only APIs (canvas, pdf.js worker) — disable SSR.
const PDFEditor = dynamic(() => import("@/components/PDFEditor"), {
  ssr: false,
  loading: () => (
    <div className="container-narrow py-16 text-center text-sm text-gray-500">
      Loading editor…
    </div>
  ),
});

const FEATURES = [
  {
    icon: "✏️",
    title: "Add text & notes",
    body: "Click anywhere on a PDF to add text in the size and color you want.",
  },
  {
    icon: "🖍️",
    title: "Highlight & draw",
    body: "Highlight key passages or draw freely with the pen tool.",
  },
  {
    icon: "🔁",
    title: "Rotate & delete pages",
    body: "Rearrange your document — fix sideways scans or remove unwanted pages.",
  },
  {
    icon: "🔒",
    title: "100% private",
    body: "All editing happens inside your browser. Your files never leave your device.",
  },
  {
    icon: "⚡",
    title: "Fast & free",
    body: "No signup. No watermarks. No upload waiting time. Edit instantly.",
  },
  {
    icon: "📱",
    title: "Works everywhere",
    body: "Use it on Windows, Mac, Linux, Chromebook, iPad — any modern browser.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-deco container-narrow relative pb-4 pt-12 sm:pt-16">
        <div className="relative z-10 text-center">
          <span className="badge-pill">
            <span aria-hidden="true">★</span> All Free PDF Editor Plus More
          </span>
          <h1 className="mt-5 text-5xl font-extrabold tracking-tighter text-ink-900 sm:text-6xl lg:text-7xl">
            <span className="block">Edit any PDF—</span>
            <span className="block text-brand-600">right in your browser</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-600 sm:text-lg">
            Add text, draw, highlight, rotate or delete pages, and download
            the edited PDF.
            <br className="hidden sm:block" />
            No sign-up. No watermarks. Files stay on your device.
          </p>
        </div>
      </section>

      {/* Top ad slot */}
      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      {/* Editor */}
      <PDFEditor />

      {/* Mid-page ad slot */}
      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      {/* Features */}
      <section className="container-narrow py-12">
        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
          Everything you need to work with PDFs
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
          GetPDFTool is built for everyone — students, teachers, freelancers,
          and small businesses. Free forever, with more tools coming soon.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 text-lg font-semibold text-gray-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How-it-works */}
      <section className="container-narrow py-8">
        <div className="rounded-3xl bg-gradient-to-br from-brand-50 to-accent-500/5 p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            How it works
          </h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            <li>
              <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                1
              </div>
              <h3 className="mt-3 font-semibold text-gray-900">
                Open your PDF
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Drag and drop, or pick a file from your computer.
              </p>
            </li>
            <li>
              <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                2
              </div>
              <h3 className="mt-3 font-semibold text-gray-900">
                Edit with the toolbar
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Add text, draw, highlight, or rotate pages.
              </p>
            </li>
            <li>
              <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                3
              </div>
              <h3 className="mt-3 font-semibold text-gray-900">Download</h3>
              <p className="mt-1 text-sm text-gray-600">
                Save your edited PDF in one click — straight to your device.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Organise PDF section */}
      <RelatedTools heading="Organise PDF — all-in-one tools" />

      {/* Convert from PDF section */}
      <ConvertFromTools />

      {/* Convert to PDF section */}
      <ConvertToTools />

      {/* Bottom ad slot */}
      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      {/* FAQ */}
      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Frequently asked questions
        </h2>
        <div className="mt-6 space-y-4">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-soft"
            >
              <summary className="cursor-pointer list-none text-base font-semibold text-gray-900">
                <span className="mr-2 text-brand-600 group-open:rotate-90 inline-block transition">
                  ▶
                </span>
                {faq.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

const FAQS = [
  {
    q: "Is GetPDFTool really free?",
    a: "Yes. The PDF editor is 100% free to use, with no sign-up, no trial period, and no watermarks added to your files. We pay for the site by showing relevant advertising.",
  },
  {
    q: "Are my files uploaded to your servers?",
    a: "No. Editing happens entirely inside your web browser using JavaScript. The PDF you open never leaves your device, which keeps your documents private.",
  },
  {
    q: "What kinds of PDFs can I edit?",
    a: "Most standard PDFs — including text documents, scanned pages, forms, and reports. Password-protected PDFs need to be unlocked first using your password.",
  },
  {
    q: "Will my edits look the same when I download the file?",
    a: "Yes. When you click Download, we generate a brand-new PDF that includes your text, drawings, highlights, page rotations, and deletions exactly as you arranged them.",
  },
  {
    q: "Which browsers are supported?",
    a: "Any modern browser works: Chrome, Firefox, Safari, Edge, Brave, Opera, and others. For best performance we recommend keeping your browser up to date.",
  },
  {
    q: "Do you have other PDF tools?",
    a: "Yes — and more are on the way. We are continuously adding tools such as merge, split, compress, convert, sign and many others. Check back soon.",
  },
];
