import Link from "next/link";

export type ToolCard = {
  href: string;
  icon: string;
  title: string;
  body: string;
};

export const ORGANISE_TOOLS: ToolCard[] = [
  {
    href: "/organise",
    icon: "🗂️",
    title: "Organise PDF — All in one",
    body: "Reorder, merge, rotate, copy or delete any pages with drag-and-drop.",
  },
  {
    href: "/merge-pdf",
    icon: "🔗",
    title: "Merge PDF",
    body: "Combine two or more PDFs into a single file in seconds.",
  },
  {
    href: "/add-pdf-pages",
    icon: "➕",
    title: "Add PDF Pages",
    body: "Insert blank pages or pages from another PDF anywhere in the file.",
  },
  {
    href: "/delete-pdf-pages",
    icon: "🗑️",
    title: "Delete PDF Pages",
    body: "Remove one or many unwanted pages from a PDF in one click.",
  },
  {
    href: "/copy-pdf-pages",
    icon: "⎘",
    title: "Copy PDF Pages",
    body: "Duplicate any page (or batch of pages) inside a PDF.",
  },
  {
    href: "/rotate-pdf",
    icon: "🔄",
    title: "Rotate PDF",
    body: "Fix sideways scans — rotate pages clockwise or counter-clockwise.",
  },
  {
    href: "/compress-pdf",
    icon: "🗜️",
    title: "Compress PDF",
    body: "Shrink PDF file size with three quality levels. See size before and after.",
  },
  {
    href: "/sign-pdf",
    icon: "✍️",
    title: "Sign PDF",
    body: "Add a signature image, today's date, and a company stamp — all in your browser.",
  },
  {
    href: "/watermark-pdf",
    icon: "🌊",
    title: "Watermark PDF",
    body: "Drop DRAFT, CONFIDENTIAL or your logo onto every page with full position and opacity control.",
  },
];

export default function RelatedTools({
  excludeHref,
  heading = "Related PDF tools",
}: {
  excludeHref?: string;
  heading?: string;
}) {
  const items = ORGANISE_TOOLS.filter((t) => t.href !== excludeHref);
  return (
    <section className="container-narrow py-12">
      <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
        {heading}
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        Free, browser-based PDF tools — your files stay on your device.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-lg text-white">
                {t.icon}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-brand-700">
                  {t.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  {t.body}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
