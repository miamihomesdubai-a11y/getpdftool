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

const PAGE_URL = "https://www.getpdftool.com/pdf-to-powerpoint";

export const metadata: Metadata = {
  title:
    "PDF to PowerPoint Online — Convert PDF to PPTX Free | GetPDFTool",
  description:
    "Free online PDF to PowerPoint converter. Turn each PDF page into a high-resolution slide. Browser-based, no signup, no upload — your file stays private.",
  keywords: [
    "PDF to PowerPoint",
    "PDF to PPT",
    "PDF to PPTX",
    "PDF to PowerPoint online",
    "PDF to PowerPoint free",
    "convert PDF to PowerPoint",
    "PDF to slides",
    "PDF to slideshow",
    "PDF to Keynote",
    "PDF to Google Slides",
    "free PDF to PowerPoint converter",
    "PDF page to slide",
    "GetPDFTool",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "PDF to PowerPoint — Free Online PDF to PPTX Converter",
    description:
      "Each PDF page becomes a sharp slide. Free, browser-based, your file stays private.",
    url: PAGE_URL,
    siteName: "GetPDFTool",
    type: "website",
  },
};

const FAQS = [
  {
    q: "How do I convert a PDF to PowerPoint online for free?",
    a: "Drop your PDF on this page or pick one from your computer, then click Convert to PowerPoint. We render each page as a high-resolution image and embed it as a slide in a real .pptx file you can open in PowerPoint, Keynote or Google Slides.",
  },
  {
    q: "Will the slides be editable?",
    a: "Each slide is the full page rendered as a sharp image, so the slide background is fixed. You can add new text boxes, shapes, animations and notes on top in PowerPoint just like any other slide. To get editable text from a PDF, use our PDF to Word converter instead.",
  },
  {
    q: "Why use image-based slides?",
    a: "Image-per-slide gives perfect visual fidelity — exactly the layout, fonts, colours and graphics from the source PDF. Text-extraction approaches often misalign columns, lose images and break complex layouts.",
  },
  {
    q: "What's the slide size?",
    a: "Slides are exported in 16:9 widescreen format (the modern PowerPoint default), with the source page scaled to fit.",
  },
  {
    q: "Is my PDF uploaded to your servers?",
    a: "No. Conversion runs entirely inside your web browser. Your PDF and the resulting PPTX file never leave your device.",
  },
  {
    q: "Which apps can open the .pptx output?",
    a: "Microsoft PowerPoint, Apple Keynote, Google Slides, LibreOffice Impress, WPS Presentation — basically every modern presentation app.",
  },
  {
    q: "Are there file-size limits?",
    a: "There's no fixed limit, but very long PDFs (hundreds of pages) take longer because everything happens in your browser. Most files finish in seconds.",
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
  name: "PDF to PowerPoint — GetPDFTool",
  url: PAGE_URL,
  applicationCategory: "Utility",
  operatingSystem: "Any (web browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Convert each PDF page into a 16:9 slide",
    "Image-per-slide for perfect visual fidelity",
    "Opens in PowerPoint, Keynote, Google Slides, Impress",
    "Browser-based — files never leave your device",
    "Save, Share or Email the result",
  ],
};

const howToData = howToJsonLd({
  name: "How to convert PDF to PowerPoint online for free",
  description:
    "Turn every PDF page into a 16:9 PowerPoint slide with GetPDFTool's free online converter.",
  url: PAGE_URL,
  totalTimeISO: "PT1M",
  steps: [
    {
      name: "Open your PDF",
      text: "Drop a PDF on the page or pick one from your computer.",
    },
    {
      name: "Convert to PowerPoint",
      text: "Click Convert to PowerPoint — each page is rendered as a high-resolution image on a 16:9 slide.",
    },
    {
      name: "Download & present",
      text: "Download the .pptx and open it in PowerPoint, Keynote or Google Slides.",
    },
  ],
});

const breadcrumbData = breadcrumbJsonLd([
  { name: "Home", url: "https://www.getpdftool.com" },
  { name: "PDF to PowerPoint", url: PAGE_URL },
]);

export default function PdfToPptxPage() {
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
            PDF to PowerPoint
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Convert PDF to PowerPoint —{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              free, sharp slides
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
            Turn every page of a PDF into a 16:9 slide. Open the result in
            PowerPoint, Keynote or Google Slides and add notes, animations or
            new content on top. Free, no signup, in your browser.
          </p>
        </div>
      </section>

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <ConvertFromPdfTool target="pptx" />

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          PDF to PowerPoint — frequently asked questions
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
        excludeHref="/pdf-to-powerpoint"
        heading="More PDF conversions"
      />
      <RelatedTools heading="Edit your PDF in other ways" />
    </>
  );
}
