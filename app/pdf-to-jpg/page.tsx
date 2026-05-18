import dynamic from "next/dynamic";
import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";
import RelatedTools from "@/components/RelatedTools";
import ConvertFromTools from "@/components/ConvertFromTools";
import {
  breadcrumbJsonLd,
  howToJsonLd,
  ldScriptProps,
} from "@/lib/seo";

const ConvertFromPdfTool = dynamic(
  () => import("@/components/ConvertFromPdfTool"),
  {
    ssr: false,
    loading: () => (
      <div className="container-narrow py-16 text-center text-sm text-gray-500">
        Loading converter…
      </div>
    ),
  }
);

const PAGE_URL = "https://www.getpdftool.com/pdf-to-jpg";

export const metadata: Metadata = {
  title:
    "PDF to JPG Online — Convert PDF Pages to JPG Images Free | GetPDFTool",
  description:
    "Free online PDF to JPG converter. Turn every page of a PDF into a JPG image with adjustable quality. Browser-based, no signup, no upload — your file stays private.",
  keywords: [
    "PDF to JPG",
    "PDF to JPEG",
    "PDF to JPG online",
    "convert PDF to JPG",
    "PDF to image",
    "PDF page to JPG",
    "PDF to JPG free",
    "free PDF to JPG converter",
    "high quality PDF to JPG",
    "PDF page to image",
    "GetPDFTool",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "PDF to JPG — Free Online PDF to Image Converter",
    description:
      "Each PDF page becomes a JPG image. Choose quality, download a single image or a ZIP. Free, browser-based.",
    url: PAGE_URL,
    siteName: "GetPDFTool",
    type: "website",
  },
};

const FAQS = [
  {
    q: "How do I convert a PDF to JPG online for free?",
    a: "Drop a PDF here or pick one from your computer, choose an image quality (Low / Medium / High), then click Convert to JPG. Each page becomes its own JPG. Multi-page PDFs are bundled into a ZIP for one-click download.",
  },
  {
    q: "What does the quality setting change?",
    a: "Low (100 DPI, q 0.70) gives small files for quick sharing. Medium (150 DPI, q 0.85) is the recommended balance for screen and print. High (220 DPI, q 0.95) produces crisp output suitable for printing and detailed inspection.",
  },
  {
    q: "Are my PDFs uploaded to your servers?",
    a: "No. Conversion runs entirely inside your web browser. Your PDF and the JPG output never leave your device.",
  },
  {
    q: "Can I convert just one specific page?",
    a: "This tool exports every page of the PDF. To get a single page, first use our Organise PDF tool to delete unwanted pages, save, and convert the remaining one-page PDF to JPG.",
  },
  {
    q: "Does it work with scanned PDFs?",
    a: "Yes. Whether the PDF contains text or is purely scanned images, every page is rendered to a JPG.",
  },
  {
    q: "Will the JPGs be transparent?",
    a: "JPG doesn't support transparency. Pages are rendered onto a white background. If you need transparency, render to PNG (we may add PNG output as an option in the future).",
  },
  {
    q: "Are there limits on file size or page count?",
    a: "No fixed limit, but very large PDFs (hundreds of pages) take longer because rendering happens in your browser. Most files finish in seconds.",
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
  name: "PDF to JPG — GetPDFTool",
  url: PAGE_URL,
  applicationCategory: "Utility",
  operatingSystem: "Any (web browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Convert every PDF page to a JPG image",
    "Three quality presets (Low / Medium / High)",
    "Multi-page PDFs zipped automatically",
    "Browser-based — files never leave your device",
    "Save, Share or Email the result",
  ],
};

const howToData = howToJsonLd({
  name: "How to convert PDF to JPG online for free",
  description:
    "Turn every page of a PDF into a JPG image with GetPDFTool's free online converter.",
  url: PAGE_URL,
  totalTimeISO: "PT1M",
  steps: [
    {
      name: "Open your PDF",
      text: "Drop a PDF on the page or pick one from your computer.",
    },
    {
      name: "Pick a quality",
      text: "Choose Low, Medium or High image quality for the output JPGs.",
    },
    {
      name: "Convert & download",
      text: "Click Convert to JPG. Single-page PDFs download as one JPG; multi-page PDFs as a ZIP.",
    },
  ],
});

const breadcrumbData = breadcrumbJsonLd([
  { name: "Home", url: "https://www.getpdftool.com" },
  { name: "PDF to JPG", url: PAGE_URL },
]);

export default function PdfToJpgPage() {
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
            PDF to JPG
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Convert PDF to JPG —{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              free, high quality, private
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
            Turn every page of a PDF into a sharp JPG image. Pick a quality
            level, download a single image or a zipped folder of all pages.
            Free, no signup, in your browser.
          </p>
        </div>
      </section>

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <ConvertFromPdfTool target="jpg" />

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          PDF to JPG — frequently asked questions
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

      <ConvertFromTools
        excludeHref="/pdf-to-jpg"
        heading="More PDF conversions"
      />
      <RelatedTools heading="Edit your PDF in other ways" />
    </>
  );
}
