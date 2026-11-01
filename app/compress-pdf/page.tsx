import dynamic from "next/dynamic";
import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";
import RelatedTools from "@/components/RelatedTools";
import {
  breadcrumbJsonLd,
  howToJsonLd,
  ldScriptProps,
} from "@/lib/seo";

const CompressTool = dynamic(() => import("@/components/CompressTool"), {
  ssr: false,
  loading: () => (
    <div className="container-narrow py-16 text-center text-sm text-gray-500">
      Loading compressor…
    </div>
  ),
});

const PAGE_URL = "https://www.getpdftool.com/compress-pdf";

export const metadata: Metadata = {
  title: "Compress PDF Online — Reduce PDF File Size Free | GetPDFTool",
  description:
    "Free online PDF compressor. Reduce PDF file size with two compression settings — see the original size before and the new size after. Browser-based, no signup, no upload.",
  keywords: [
    "compress PDF",
    "compress PDF online",
    "compress PDF free",
    "reduce PDF size",
    "reduce PDF file size",
    "shrink PDF",
    "shrink PDF online",
    "PDF compressor",
    "online PDF compressor",
    "free PDF compressor",
    "make PDF smaller",
    "PDF size reducer",
    "compress PDF for email",
    "GetPDFTool",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Compress PDF — Free Online PDF Compressor",
    description:
      "Reduce PDF file size with two compression settings. Free, browser-based, your file stays private.",
    url: PAGE_URL,
    siteName: "GetPDFTool",
    type: "website",
  },
};

const FAQS = [
  {
    q: "How much can I shrink a PDF?",
    a: 'Results depend on the file. There is no guaranteed reduction. Image-heavy PDFs may benefit from Recommended; an already compact text PDF may stay the same size or grow. Compare the output and keep your original.',
  },
  {
    q: "What's the difference between the two compression settings?",
    a: 'High quality re-saves the PDF with structural optimisations and retains selectable text. Recommended renders pages at 150 DPI as JPEG images. It may reduce image-heavy files, but loses searchable text and interactive document features.',
  },
  {
    q: "Will the compressed PDF still be searchable?",
    a: 'High quality preserves the existing text layer. Recommended rebuilds pages as images, so their text is no longer selectable or searchable.',
  },
  {
    q: "Is the file uploaded to your server?",
    a: "No. All compression runs inside your web browser using JavaScript. Your file never leaves your computer, which keeps your documents private.",
  },
  {
    q: "Why is my compressed file the same size or larger?",
    a: 'Already optimised PDFs may not shrink further. Rasterising compact text pages can create a larger file. Compare both settings and keep the original if neither result is suitable.',
  },
  {
    q: "Can I compress a PDF for email?",
    a: 'You can try either setting and compare the downloaded file against your email service’s attachment limit. A target size is not guaranteed. Attach the saved file yourself when sending.',
  },
  {
    q: "Does compressing change the page count?",
    a: "No. The compressed PDF has the same number of pages and the same dimensions as the original. Only the visual quality and storage size change.",
  },
  {
    q: "Will the compressed PDF print well?",
    a: 'Inspect the output at the intended print size. High quality preserves the original page content; Recommended can soften fine details because pages become images. Keep the original for archival use.',
  },
  {
    q: "Are there file-size or page-count limits?",
    a: "There's no fixed limit, but very large PDFs (hundreds of pages or 100 MB+) take longer because everything happens in your browser. Most files compress in seconds.",
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
  name: "Compress PDF — GetPDFTool",
  url: PAGE_URL,
  applicationCategory: "Utility",
  operatingSystem: "Any (web browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Three compression levels (lossless, recommended, smallest)",
    "Shows original file size and compressed size",
    "Calculates % saved",
    "Browser-based — files never leave your device",
    "Save, Share or Email the compressed PDF",
  ],
};

const howToData = howToJsonLd({
  name: "How to compress a PDF online for free",
  description:
    "Shrink PDF files with GetPDFTool's free online compressor — choose a quality level and download the smaller file.",
  url: PAGE_URL,
  totalTimeISO: "PT1M",
  steps: [
    {
      name: "Open your PDF",
      text: "Drop a PDF on the page or pick one from your computer. We immediately show its size.",
    },
    {
      name: "Pick a level",
      text: "High quality preserves selectable text; Recommended renders pages as images. Compare file size and legibility.",
    },
    {
      name: "Compress & download",
      text: "Click Compress PDF, see the new size and savings, then Download — or Share / Email.",
    },
  ],
});

const breadcrumbData = breadcrumbJsonLd([
  { name: "Home", url: "https://www.getpdftool.com" },
  { name: "Compress PDF", url: PAGE_URL },
]);

const FEATURES = [
  {
    icon: "🗜",
    title: "Three quality levels",
    body: "Choose High quality to preserve text, or Recommended for image-based compression. Compare the result with your original.",
  },
  {
    icon: "📊",
    title: "See sizes before & after",
    body: "We show the original file size, the new compressed size, and the percentage saved.",
  },
  {
    icon: "🔒",
    title: "100% private",
    body: "Compression runs entirely in your browser. Your PDF is never uploaded or stored.",
  },
  {
    icon: "📧",
    title: "Compress for email",
    body: "Get your file under common 25 MB attachment limits in seconds, then send straight from the tool.",
  },
  {
    icon: "🖨️",
    title: "Print-ready output",
    body: "High quality and Recommended levels stay sharp for on-screen reading and most print jobs.",
  },
  {
    icon: "📤",
    title: "Save, Share or Email",
    body: "Once compressed, download, share via the system share menu, or open your email app pre-filled.",
  },
];

export default function CompressPdfPage() {
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
            Compress PDF
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Compress PDF online —{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              reduce file size, free
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
            Shrink PDFs for email, upload, or storage. Pick a quality level,
            see exactly how much smaller the file becomes, and download. Your
            PDF never leaves your browser.
          </p>
        </div>
      </section>

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <CompressTool />

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Everything in this PDF compressor
        </h2>
        <p className="mt-3 max-w-2xl text-gray-600">
          A free, fast, private compressor for everyday use — no signup, no
          watermark, no upload.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      <section className="container-narrow py-8">
        <div className="rounded-3xl bg-gradient-to-br from-brand-50 to-accent-500/5 p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            How to compress a PDF in 3 steps
          </h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {[
              {
                n: 1,
                t: "Open your PDF",
                b: "Drop a PDF on the page or pick one from your computer. We immediately show its size.",
              },
              {
                n: 2,
                t: "Pick a level",
                b: "High quality preserves selectable text; Recommended renders pages as images. Compare file size and legibility.",
              },
              {
                n: 3,
                t: "Compress & download",
                b: "Click Compress PDF, see the new size and savings, then Download — or Share / Email.",
              },
            ].map((s) => (
              <li key={s.n}>
                <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {s.n}
                </div>
                <h3 className="mt-3 font-semibold text-gray-900">{s.t}</h3>
                <p className="mt-1 text-sm text-gray-600">{s.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Compress PDF — frequently asked questions
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

      <RelatedTools excludeHref="/compress-pdf" />
    </>
  );
}
