import dynamic from "next/dynamic";
import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";
import RelatedTools from "@/components/RelatedTools";
import {
  breadcrumbJsonLd,
  howToJsonLd,
  ldScriptProps,
} from "@/lib/seo";

const WatermarkTool = dynamic(() => import("@/components/WatermarkTool"), {
  ssr: false,
  loading: () => (
    <div className="container-narrow py-16 text-center text-sm text-gray-500">
      Loading watermarker…
    </div>
  ),
});

const PAGE_URL = "https://www.getpdftool.com/watermark-pdf";

export const metadata: Metadata = {
  title:
    "Add Watermark to PDF Online — Free Text & Image Watermark Tool | GetPDFTool",
  description:
    "Add a text or image watermark to a PDF online for free. Choose position, opacity, rotation and font, preview every page, then download. Browser-based, no signup, no upload.",
  keywords: [
    "watermark PDF",
    "add watermark to PDF",
    "PDF watermark",
    "PDF watermark online",
    "free PDF watermark",
    "text watermark PDF",
    "image watermark PDF",
    "DRAFT watermark PDF",
    "CONFIDENTIAL watermark",
    "stamp PDF online",
    "logo watermark PDF",
    "free PDF watermark tool",
    "watermark PDF online free",
    "GetPDFTool",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Watermark PDF — Free Online Text & Image Watermark Tool",
    description:
      "Add DRAFT, CONFIDENTIAL or your logo to every PDF page. Free, browser-based, your file stays private.",
    url: PAGE_URL,
    siteName: "GetPDFTool",
    type: "website",
  },
};

const FAQS = [
  {
    q: "How do I add a watermark to a PDF online for free?",
    a: "Drop your PDF on this page, choose Text or Image watermark, set the words (or upload your logo), pick a position and opacity, then click Save Changes and Download. Everything happens in your browser.",
  },
  {
    q: "Can I add a DRAFT or CONFIDENTIAL watermark?",
    a: "Yes. Switch to Text watermark, type DRAFT (or CONFIDENTIAL, COPY, etc.), pick a colour and rotation, and apply to all pages. The default settings already produce a classic diagonal red DRAFT mark.",
  },
  {
    q: "Can I use my company logo as a watermark?",
    a: "Yes. Switch to Image watermark and upload a PNG or JPEG of your logo. PNG with a transparent background looks best because it blends cleanly into the document.",
  },
  {
    q: "Can I control where the watermark appears?",
    a: "Yes. There's a 9-point position grid (top-left, top, top-right, middle-left, centre, middle-right, bottom-left, bottom, bottom-right). You can also set rotation from −90° to +90° and opacity from 5% to 100%.",
  },
  {
    q: "Can I watermark only some pages?",
    a: "Yes. Toggle the Pages selector to Range and enter a from–to page number. Only pages in that range get the watermark; the others are left untouched.",
  },
  {
    q: "Is the watermark baked into the saved PDF?",
    a: "Yes. The watermark is drawn into the PDF page content, so it shows up in every PDF viewer (Acrobat, Preview, Chrome) and prints correctly. It cannot be removed by simply unchecking a layer.",
  },
  {
    q: "Are my files uploaded to your servers?",
    a: "No. Watermarking happens entirely inside your web browser. Your PDF and your watermark image never leave your device.",
  },
  {
    q: "What image formats are supported for watermarks?",
    a: "PNG and JPEG. PNG with transparency is recommended for logo watermarks because the surrounding area stays see-through.",
  },
  {
    q: "Can I add multiple watermarks?",
    a: "This tool applies one watermark at a time across the chosen pages. To stack a text and an image watermark, save the file with one watermark, then drop the saved file back in and apply the second.",
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
  name: "Watermark PDF — GetPDFTool",
  url: PAGE_URL,
  applicationCategory: "Utility",
  operatingSystem: "Any (web browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Text watermark with font, size, colour, bold",
    "Image watermark (PNG / JPEG)",
    "9-position grid",
    "Opacity from 5% to 100%",
    "Rotation from −90° to +90°",
    "All-pages or page-range targeting",
    "Live preview on every page",
    "Browser-based — files never leave your device",
    "Save, Share or Email the watermarked PDF",
  ],
};

const howToData = howToJsonLd({
  name: "How to add a watermark to a PDF online for free",
  description:
    "Add a text or image watermark to a PDF with GetPDFTool's free online PDF watermark tool.",
  url: PAGE_URL,
  totalTimeISO: "PT1M",
  steps: [
    {
      name: "Open your PDF",
      text: "Drop a PDF on the page or pick one from your computer.",
    },
    {
      name: "Pick text or image",
      text: "Type your watermark text (DRAFT, CONFIDENTIAL, etc.) or upload a logo PNG/JPEG.",
    },
    {
      name: "Position & download",
      text: "Choose position, opacity, rotation and pages — then click Save Changes and Download.",
    },
  ],
});

const breadcrumbData = breadcrumbJsonLd([
  { name: "Home", url: "https://www.getpdftool.com" },
  { name: "Watermark PDF", url: PAGE_URL },
]);

const FEATURES = [
  {
    icon: "🔠",
    title: "Text watermark",
    body: "DRAFT, CONFIDENTIAL, COPY or any custom text. Three font families, bold toggle, any size, any colour.",
  },
  {
    icon: "🖼️",
    title: "Image watermark",
    body: "Upload a PNG or JPEG of your logo or stamp. Width is set as a percentage of the page so it scales across different page sizes.",
  },
  {
    icon: "🎯",
    title: "9-position grid",
    body: "Top-left, top, top-right, middle-left, centre, middle-right, bottom-left, bottom, bottom-right — pick where it lands.",
  },
  {
    icon: "🌗",
    title: "Opacity & rotation",
    body: "Slider from faint to opaque, rotation from −90° to +90°. The classic DRAFT diagonal works in one click.",
  },
  {
    icon: "📑",
    title: "All pages or a range",
    body: "Watermark every page, or pick a from–to range to mark only what you need.",
  },
  {
    icon: "🔒",
    title: "100% private",
    body: "Watermarking runs entirely in your browser. Your PDF and image never leave your device.",
  },
];

export default function WatermarkPdfPage() {
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
            Watermark PDF
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Add a watermark to a PDF —{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              text or image, free
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
            DRAFT, CONFIDENTIAL, your company logo — drop one onto every PDF
            page (or just some), tweak the position, opacity and rotation,
            and download. Free, no signup, no upload.
          </p>
        </div>
      </section>

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <WatermarkTool />

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Everything in this PDF watermarker
        </h2>
        <p className="mt-3 max-w-2xl text-gray-600">
          A free, fast, private PDF watermark tool — for legal docs,
          contracts, proposals, school work and anything else where a
          permanent mark belongs on every page.
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
            How to watermark a PDF in 4 steps
          </h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: 1, t: "Open your PDF", b: "Drop a file or pick one." },
              {
                n: 2,
                t: "Pick text or image",
                b: "Type words or upload a logo PNG/JPEG.",
              },
              {
                n: 3,
                t: "Position & style",
                b: "Choose the position, opacity, rotation and pages.",
              },
              {
                n: 4,
                t: "Save & download",
                b: "Click Save Changes, then Download / Share / Email.",
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
          Watermark PDF — frequently asked questions
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

      <RelatedTools excludeHref="/watermark-pdf" />
    </>
  );
}
