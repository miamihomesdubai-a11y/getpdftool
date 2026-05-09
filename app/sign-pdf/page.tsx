import dynamic from "next/dynamic";
import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";
import RelatedTools from "@/components/RelatedTools";

const SignPdfTool = dynamic(() => import("@/components/SignPdfTool"), {
  ssr: false,
  loading: () => (
    <div className="container-narrow py-16 text-center text-sm text-gray-500">
      Loading signer…
    </div>
  ),
});

const PAGE_URL = "https://www.getpdftool.com/sign-pdf";

export const metadata: Metadata = {
  title:
    "Sign PDF Online — Add Signature, Date and Company Stamp Free | GetPDFTool",
  description:
    "Free online PDF signer. Upload a signature image, drop a date, add a company stamp, and download the signed PDF. Browser-based, no signup, no upload.",
  keywords: [
    "sign PDF",
    "sign PDF online",
    "sign PDF free",
    "PDF signature",
    "add signature to PDF",
    "upload signature to PDF",
    "PDF signer",
    "esign PDF",
    "electronic signature PDF",
    "company stamp on PDF",
    "stamp PDF",
    "add date to PDF",
    "sign PDF online free",
    "free PDF signer",
    "GetPDFTool",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Sign PDF Online — Free PDF Signer with Stamp & Date",
    description:
      "Upload a signature image, drop a date, add a company stamp. Free, browser-based, your file stays private.",
    url: PAGE_URL,
    siteName: "GetPDFTool",
    type: "website",
  },
};

const FAQS = [
  {
    q: "How do I sign a PDF online for free?",
    a: "Drop your PDF here, click Add signature, choose a PNG or JPEG of your signature from your computer, then click on the page to drop it. Drag to position and use the corner handle to resize. Click Save Changes and Download to keep the signed file.",
  },
  {
    q: "What signature image format can I upload?",
    a: "PNG or JPEG. PNG is recommended because it supports transparency, so your signature blends cleanly into the document. Most signature scanners and capture apps export PNGs.",
  },
  {
    q: "Can I add the date next to my signature?",
    a: "Yes. Click Add date and click on the page where you want it. Today's date appears as text — you can drag it to position, double-click to edit, and resize it from the corner.",
  },
  {
    q: "Can I add a company stamp?",
    a: "Yes. Click Add company stamp, upload a PNG or JPEG of your stamp, then click on the page to place it. You can drop the same stamp on multiple pages by clicking Place stamp again.",
  },
  {
    q: "Are my files uploaded to your server?",
    a: "No. Signing happens entirely inside your web browser. Your PDF and your signature image never leave your device.",
  },
  {
    q: "Is the signed PDF legally valid?",
    a: "An image-based signature placed on a PDF is what most jurisdictions call an 'electronic signature' (e-signature). It is widely accepted for routine business use. For high-stakes contracts or legal filings, you may need a digital signature with a cryptographic certificate (PKI), which is a separate workflow.",
  },
  {
    q: "Can I sign multiple PDF pages?",
    a: "Yes. After placing your signature once, click Place signature again to drop another copy on a different page. Same for the company stamp. The uploaded image stays cached for the rest of your session.",
  },
  {
    q: "Will the signature print well?",
    a: "Yes. We embed your signature as an image at full resolution. For best results, scan or capture your signature at 300 DPI or higher and use a transparent PNG.",
  },
  {
    q: "Can I undo a placement?",
    a: "Yes. Click Undo (or use the X on a placed item) to remove it. Up to 50 placement changes can be undone in one session.",
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
  name: "Sign PDF — GetPDFTool",
  url: PAGE_URL,
  applicationCategory: "Utility",
  operatingSystem: "Any (web browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Upload a signature image (PNG or JPEG)",
    "Place today's date as editable text",
    "Upload a company stamp image",
    "Drag to move, drag corner to resize",
    "Place same signature/stamp on multiple pages",
    "Browser-based — files never leave your device",
    "Save, Share or Email the signed PDF",
  ],
};

const FEATURES = [
  {
    icon: "✍️",
    title: "Upload your signature",
    body: "Pick a PNG or JPEG of your signature, click on the PDF, and you're done. Transparent PNGs blend cleanly.",
  },
  {
    icon: "📅",
    title: "Add the date",
    body: "Drop today's date next to your signature with one click. Edit the text or format inline.",
  },
  {
    icon: "🔖",
    title: "Add a company stamp",
    body: "Upload your firm's stamp as PNG/JPEG and place it on any page. Reuse it on as many pages as you need.",
  },
  {
    icon: "📐",
    title: "Drag and resize",
    body: "Position items pixel-perfect. Corner handles resize images while keeping their aspect ratio.",
  },
  {
    icon: "🔒",
    title: "100% private",
    body: "Your PDF and your signature image stay in your browser. Nothing is uploaded to our servers.",
  },
  {
    icon: "📤",
    title: "Save, Share or Email",
    body: "When you're done, save your edits and download, share via the system share menu, or open your email app.",
  },
];

export default function SignPdfPage() {
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
            Sign PDF
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Sign a PDF online —{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              signature, date and stamp
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
            Upload a signature image, drop a date, add a company stamp, then
            download the signed PDF. Free, no signup, no upload — your file
            stays in your browser.
          </p>
        </div>
      </section>

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <SignPdfTool />

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Everything in this PDF signer
        </h2>
        <p className="mt-3 max-w-2xl text-gray-600">
          A free, fast, private PDF signing tool — sign contracts, invoices,
          letters and forms from your browser.
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
            How to sign a PDF in 4 steps
          </h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: 1,
                t: "Open your PDF",
                b: "Drop a PDF on the page or pick one from your computer.",
              },
              {
                n: 2,
                t: "Add signature",
                b: "Upload a PNG or JPEG of your signature. Click on the page to drop it where you want.",
              },
              {
                n: 3,
                t: "Add date or stamp",
                b: "Click Add date for today's date, or upload a company stamp image.",
              },
              {
                n: 4,
                t: "Save and download",
                b: "Click Save Changes, then Download the signed PDF.",
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
          Sign PDF — frequently asked questions
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

      <RelatedTools excludeHref="/sign-pdf" />
    </>
  );
}
