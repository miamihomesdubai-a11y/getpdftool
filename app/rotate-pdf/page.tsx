import dynamic from "next/dynamic";
import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";
import RelatedTools from "@/components/RelatedTools";
import {
  breadcrumbJsonLd,
  howToJsonLd,
  ldScriptProps,
} from "@/lib/seo";

const OrganiseTool = dynamic(() => import("@/components/OrganiseTool"), {
  ssr: false,
  loading: () => (
    <div className="container-narrow py-16 text-center text-sm text-gray-500">
      Loading…
    </div>
  ),
});

const PAGE_URL = "https://www.getpdftool.com/rotate-pdf";

export const metadata: Metadata = {
  title: "Rotate PDF Online — Free PDF Page Rotator | GetPDFTool",
  description:
    "Rotate one page or every page of a PDF clockwise or counter-clockwise online. Free, no signup, no upload. Fix sideways scans in seconds — your file stays in your browser.",
  keywords: [
    "rotate PDF",
    "rotate PDF online",
    "rotate PDF free",
    "rotate PDF pages",
    "rotate page in PDF",
    "rotate PDF clockwise",
    "rotate PDF counter-clockwise",
    "fix sideways PDF",
    "PDF rotator",
    "free online PDF rotator",
    "GetPDFTool",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Rotate PDF — Free Online PDF Rotator",
    description:
      "Rotate any PDF page 90° at a time. Free, browser-based, your file stays private.",
    url: PAGE_URL,
    siteName: "GetPDFTool",
    type: "website",
  },
};

const FAQS = [
  {
    q: "How do I rotate a PDF online for free?",
    a: "Drop your PDF on this page. Hover over the thumbnail of the page you want to rotate and click ↻ for clockwise or ↺ for counter-clockwise. Each click rotates by 90°. Click Save Changes and Download to keep the rotation.",
  },
  {
    q: "Can I rotate just one page in a PDF?",
    a: "Yes. Each page has its own rotate buttons, so you can spin a single sideways page without changing the rest of the document.",
  },
  {
    q: "How do I rotate every page at once?",
    a: "Click the first page to select it, then Shift-click the last page to select the whole range. Then click ↻ or ↺ on any selected thumbnail and the rotation applies to all of them. Save and Download when ready.",
  },
  {
    q: "Will the rotation be saved permanently?",
    a: "Yes. The rotation is written into the saved PDF, so any viewer (Acrobat, Preview, Chrome, etc.) will display the page in the new orientation.",
  },
  {
    q: "Is the file uploaded to your servers?",
    a: "No. Rotation happens entirely inside your web browser. Your file never leaves your device.",
  },
  {
    q: "Can I undo a rotation?",
    a: "Yes. Click ↶ Undo in the toolbar (or press Cmd/Ctrl-Z) to revert the last rotation. You can step back through up to 50 changes.",
  },
  {
    q: "Will rotating affect image or text quality?",
    a: "No. We rebuild the PDF using the original page content and only update the rotation flag. There's no recompression, so quality is identical to the source.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Rotate PDF — GetPDFTool",
  url: PAGE_URL,
  applicationCategory: "Utility",
  operatingSystem: "Any (web browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Rotate one page or every page",
    "Rotate clockwise and counter-clockwise",
    "90° increments",
    "Browser-based — files never leave your device",
    "Save, Share or Email the rotated PDF",
  ],
};

const howToData = howToJsonLd({
  name: "How to rotate a PDF online for free",
  description:
    "Rotate one page or every page of a PDF with GetPDFTool's free online PDF rotator.",
  url: PAGE_URL,
  totalTimeISO: "PT1M",
  steps: [
    {
      name: "Open your PDF",
      text: "Drop a PDF on the page or pick one from your computer.",
    },
    {
      name: "Click ↻ or ↺",
      text: "Hover any thumbnail and use the rotate buttons. Each click is 90°. Select multiple pages first to rotate them together.",
    },
    {
      name: "Save and download",
      text: "Click Save Changes, then Download the rotated PDF.",
    },
  ],
});

const breadcrumbData = breadcrumbJsonLd([
  { name: "Home", url: "https://www.getpdftool.com" },
  { name: "Rotate PDF", url: PAGE_URL },
]);

export default function RotatePdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script {...ldScriptProps(howToData)} />
      <script {...ldScriptProps(breadcrumbData)} />

      <section className="container-narrow pb-2 pt-10 sm:pt-14">
        <div className="text-center">
          <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
            Rotate PDF
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Rotate PDF pages —{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              free, online, in your browser
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
            Fix sideways scans in seconds. Rotate one page, a range of pages,
            or every page of a PDF — clockwise or counter-clockwise — then
            download. No signup. No upload. The rotation is saved into the new
            file so every viewer shows it correctly.
          </p>
        </div>
      </section>

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <OrganiseTool />

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          How to rotate a PDF in 3 steps
        </h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            {
              n: 1,
              t: "Open your PDF",
              b: "Drop a PDF on the page or pick one from your computer.",
            },
            {
              n: 2,
              t: "Click ↻ or ↺",
              b: "Hover any thumbnail and use the rotate buttons. Each click is 90°. Select multiple pages first to rotate them together.",
            },
            {
              n: 3,
              t: "Save and download",
              b: "Click Save Changes, then Download the rotated PDF.",
            },
          ].map((s) => (
            <li
              key={s.n}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft"
            >
              <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {s.n}
              </div>
              <h3 className="mt-3 font-semibold text-gray-900">{s.t}</h3>
              <p className="mt-1 text-sm text-gray-600">{s.b}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-narrow py-8">
        <div className="rounded-3xl bg-gradient-to-br from-brand-50 to-accent-500/5 p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            When to use a PDF rotator
          </h2>
          <p className="mt-3 max-w-3xl text-gray-700">
            Phone scans frequently come out sideways. A coworker emails a
            mixed-orientation report. A scanned receipt is upside-down.
            Rather than re-scanning everything, just rotate the affected
            pages. GetPDFTool's rotator runs in your browser — no upload, no
            account, and the saved PDF keeps perfect quality because we only
            update the rotation flag, not the page content.
          </p>
        </div>
      </section>

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Rotate PDF — frequently asked questions
        </h2>
        <div className="mt-6 space-y-4">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-soft"
            >
              <summary className="cursor-pointer list-none text-base font-semibold text-gray-900">
                <span className="mr-2 inline-block text-brand-600 transition group-open:rotate-90">
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

      <RelatedTools excludeHref="/rotate-pdf" />
    </>
  );
}
