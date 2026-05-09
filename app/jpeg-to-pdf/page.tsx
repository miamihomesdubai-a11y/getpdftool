import dynamic from "next/dynamic";
import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";
import RelatedTools from "@/components/RelatedTools";
import ConvertFromTools from "@/components/ConvertFromTools";
import ConvertToTools from "@/components/ConvertToTools";

const ConvertToPdfTool = dynamic(
  () => import("@/components/ConvertToPdfTool"),
  {
    ssr: false,
    loading: () => (
      <div className="container-narrow py-16 text-center text-sm text-gray-500">
        Loading converter…
      </div>
    ),
  }
);

const PAGE_URL = "https://www.getpdftool.com/jpeg-to-pdf";

export const metadata: Metadata = {
  title: "JPEG to PDF Online — Convert JPG / PNG to PDF Free | GetPDFTool",
  description:
    "Free online JPEG to PDF converter. Combine JPG and PNG images into a single PDF, full resolution, in your browser. No signup, no upload.",
  keywords: [
    "JPEG to PDF",
    "JPG to PDF",
    "PNG to PDF",
    "image to PDF",
    "convert JPG to PDF",
    "convert images to PDF",
    "combine images into PDF",
    "merge images to PDF",
    "photos to PDF",
    "JPEG to PDF online",
    "free JPG to PDF",
    "GetPDFTool",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "JPEG to PDF — Free Online Image to PDF Converter",
    description:
      "Combine JPG and PNG images into one PDF, full resolution, browser-based.",
    url: PAGE_URL,
    siteName: "GetPDFTool",
    type: "website",
  },
};

const FAQS = [
  {
    q: "How do I convert a JPEG to PDF for free?",
    a: "Drop one or many JPG/PNG images on the page (or click to choose them), arrange them in the order you want using the up/down arrows, then click Convert to PDF. You'll get a single PDF with one image per page.",
  },
  {
    q: "Can I combine multiple images into one PDF?",
    a: "Yes. Pick or drop several images at once. Each image becomes a page in the order you arrange them. Use the ↑ ↓ buttons to reorder, or ✕ to remove an image.",
  },
  {
    q: "Are PNG files supported?",
    a: "Yes — PNG and JPEG are both supported. Transparent PNGs are flattened to a white background in the PDF.",
  },
  {
    q: "Will the original image quality be preserved?",
    a: "Yes. Each page in the PDF is sized to match the image's pixel dimensions, so the picture stays at its original resolution. We do not re-compress.",
  },
  {
    q: "Is the file uploaded to your server?",
    a: "No. Conversion runs entirely inside your web browser. Your photos and the resulting PDF never leave your device.",
  },
  {
    q: "Can I convert HEIC photos from my iPhone?",
    a: "Most browsers can't decode HEIC directly. Convert to JPG first using your phone's share menu (or any free HEIC-to-JPG tool), then drop the JPG here.",
  },
  {
    q: "Are there file-count or size limits?",
    a: "There is no fixed limit, but very large image sets (50+ photos) take longer and use more memory because the work happens in your browser.",
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
  name: "JPEG to PDF — GetPDFTool",
  url: PAGE_URL,
  applicationCategory: "Utility",
  operatingSystem: "Any (web browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function JpegToPdfPage() {
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

      <section className="container-narrow pb-2 pt-10 sm:pt-14">
        <div className="text-center">
          <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
            JPEG to PDF
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Convert JPG / PNG to PDF —{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              free, full resolution
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
            Combine one or many photos into a single PDF — perfect for
            receipts, ID scans, photo albums or coursework. Free, browser-
            based, your images stay private.
          </p>
        </div>
      </section>

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <ConvertToPdfTool source="jpeg" />

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          JPEG to PDF — frequently asked questions
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

      <ConvertToTools
        excludeHref="/jpeg-to-pdf"
        heading="More 'Convert to PDF' tools"
      />
      <ConvertFromTools heading="Or go the other way: Convert FROM PDF" />
      <RelatedTools heading="Edit your PDF in other ways" />
    </>
  );
}
