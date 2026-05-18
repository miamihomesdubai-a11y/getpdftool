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

const PAGE_URL = "https://www.getpdftool.com/merge-pdf";

export const metadata: Metadata = {
  title: "Merge PDF Online — Combine PDF Files Free | GetPDFTool",
  description:
    "Merge two or more PDF files into one online — free, no signup, no upload. Drag-and-drop to reorder, then download the combined PDF. Browser-based, your files stay private.",
  keywords: [
    "merge PDF",
    "merge PDF online",
    "merge PDF free",
    "combine PDF",
    "combine PDF files",
    "join PDFs",
    "merge PDFs into one",
    "PDF merger",
    "PDF combiner",
    "merge multiple PDFs",
    "free PDF merger",
    "online PDF merger",
    "GetPDFTool",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Merge PDF Online — Free PDF Combiner",
    description:
      "Combine multiple PDF files into one. Free, browser-based, no signup.",
    url: PAGE_URL,
    siteName: "GetPDFTool",
    type: "website",
  },
};

const FAQS = [
  {
    q: "How do I merge two PDFs into one online?",
    a: "Open the first PDF on this page. Click + Add Page in the toolbar and choose 'Pages from PDF…' to append the second file. The pages from both PDFs now sit in one continuous document — drag them to rearrange, then click Save Changes and Download.",
  },
  {
    q: "Can I merge more than two PDFs?",
    a: "Yes. After opening the first file, repeat the + Add Page → Pages from PDF… action for each additional PDF. There's no fixed limit — large files just take a moment to render thumbnails.",
  },
  {
    q: "Will the merged PDF preserve original quality?",
    a: "Yes. We rebuild the PDF using the original page content. Text, images, fonts and embedded resources are preserved — there is no recompression.",
  },
  {
    q: "Are my files uploaded to your servers?",
    a: "No. Merging happens entirely in your web browser using JavaScript. Nothing is sent to us, which keeps your documents private.",
  },
  {
    q: "Can I merge PDFs on my phone?",
    a: "Yes. The tool works on iPhone, iPad and Android browsers. Tap + Add Page → Pages from PDF…, choose your second file, then Save Changes and Download.",
  },
  {
    q: "Is there a file-size limit?",
    a: "There's no fixed limit, but very large files (hundreds of pages or 100MB+) will be slower because everything happens in your browser. For typical documents the merge is instant.",
  },
  {
    q: "Can I reorder pages after merging?",
    a: "Yes. After both PDFs are loaded, drag any page thumbnail to the position you want. Page numbers update automatically. You can also rotate, duplicate or delete pages before saving.",
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
  name: "Merge PDF — GetPDFTool",
  url: PAGE_URL,
  applicationCategory: "Utility",
  operatingSystem: "Any (web browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Merge two or more PDF files into one",
    "Drag-and-drop to reorder pages between files",
    "Rotate, duplicate or delete pages before merging",
    "Browser-based — files never leave your device",
    "Save, Share or Email the merged PDF",
  ],
};

const howToData = howToJsonLd({
  name: "How to merge PDF files online for free",
  description:
    "Combine two or more PDF files into one document with GetPDFTool's free online PDF merger.",
  url: PAGE_URL,
  totalTimeISO: "PT1M",
  steps: [
    {
      name: "Open your first PDF",
      text: "Drop a PDF on the page or pick one from your computer.",
    },
    {
      name: "Append the others",
      text: "Click + Add Page → Pages from PDF… for each extra file. Drag thumbnails to reorder.",
    },
    {
      name: "Save and download",
      text: "Click Save Changes, then Download the merged PDF.",
    },
  ],
});

const breadcrumbData = breadcrumbJsonLd([
  { name: "Home", url: "https://www.getpdftool.com" },
  { name: "Merge PDF", url: PAGE_URL },
]);

export default function MergePdfPage() {
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
            Merge PDF
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Merge PDF files{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              into one — free
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
            Combine two or more PDFs into a single, neatly-ordered document.
            Open the first file, append the rest, drag pages to reorder, then
            download. No signup. No upload. Works in your browser.
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
          How to merge PDFs in 3 steps
        </h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            {
              n: 1,
              t: "Open your first PDF",
              b: "Drop a PDF on the page or pick one from your computer.",
            },
            {
              n: 2,
              t: "Append the others",
              b: "Click + Add Page → Pages from PDF… for each extra file. Drag thumbnails to reorder.",
            },
            {
              n: 3,
              t: "Save and download",
              b: "Click Save Changes, then Download the merged PDF.",
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
            Why combine PDFs with GetPDFTool?
          </h2>
          <p className="mt-3 max-w-3xl text-gray-700">
            Most PDF mergers force you to upload your files to a stranger's
            server, then make you wait, then watermark the result, then ask for
            a paid plan. GetPDFTool's merger runs entirely inside your browser
            — your files are never uploaded, the result is unwatermarked, and
            it's free forever. You also get reordering, rotation, copy and
            delete on the same page, so you can shape the merged PDF exactly
            as you need before downloading.
          </p>
        </div>
      </section>

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Merge PDF — frequently asked questions
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

      <RelatedTools excludeHref="/merge-pdf" />
    </>
  );
}
