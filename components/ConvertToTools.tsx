import Link from "next/link";

export type ConvertCard = {
  href: string;
  icon: string;
  title: string;
  body: string;
};

export const CONVERT_TO_PDF_TOOLS: ConvertCard[] = [
  {
    href: "/word-to-pdf",
    icon: "📄",
    title: "Word to PDF",
    body: "Turn .docx into a clean PDF. Headings, lists, tables and inline images preserved.",
  },
  {
    href: "/excel-to-pdf",
    icon: "📊",
    title: "Excel to PDF",
    body: "Render every sheet of an .xlsx workbook as a tidy table on its own PDF page.",
  },
  {
    href: "/jpeg-to-pdf",
    icon: "🖼️",
    title: "JPEG / PNG to PDF",
    body: "Combine one or many images into a single PDF at full resolution.",
  },
  {
    href: "/html-to-pdf",
    icon: "🌐",
    title: "HTML to PDF",
    body: "Paste markup or upload an .html file — get a multi-page PDF with your styles.",
  },
];

export default function ConvertToTools({
  excludeHref,
  heading = "Convert to PDF",
}: {
  excludeHref?: string;
  heading?: string;
}) {
  const items = CONVERT_TO_PDF_TOOLS.filter((t) => t.href !== excludeHref);
  return (
    <section className="container-narrow py-12">
      <h2 className="text-center text-2xl font-bold text-ink-900 sm:text-left sm:text-3xl">
        {heading}
      </h2>
      <p className="mt-2 text-center text-sm text-ink-600 sm:text-left">
        Turn Word, Excel, images or HTML into PDF — free, browser-based, your
        files stay private.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group rounded-2xl border border-ink-100 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-pop"
          >
            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
              <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-brand-500 text-lg text-white shadow-soft">
                {t.icon}
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink-900 group-hover:text-brand-700">
                  {t.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">
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
