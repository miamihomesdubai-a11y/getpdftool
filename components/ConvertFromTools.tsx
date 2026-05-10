import Link from "next/link";

export type ConvertCard = {
  href: string;
  icon: string;
  title: string;
  body: string;
};

export const CONVERT_FROM_PDF_TOOLS: ConvertCard[] = [
  {
    href: "/pdf-to-word",
    icon: "📄",
    title: "PDF to Word",
    body: "Editable .docx — opens in Word, Google Docs, Pages, LibreOffice.",
  },
  {
    href: "/pdf-to-excel",
    icon: "📊",
    title: "PDF to Excel",
    body: "Editable .xlsx — one sheet per page, words placed in cells by position.",
  },
  {
    href: "/pdf-to-powerpoint",
    icon: "🎯",
    title: "PDF to PowerPoint",
    body: "Each PDF page becomes a sharp 16:9 slide.",
  },
  {
    href: "/pdf-to-text",
    icon: "📝",
    title: "PDF to Text",
    body: "Extract every word as a clean .txt file.",
  },
  {
    href: "/pdf-to-jpg",
    icon: "🖼️",
    title: "PDF to JPG",
    body: "Each page becomes a JPG image. Multi-page PDFs zipped automatically.",
  },
];

export default function ConvertFromTools({
  excludeHref,
  heading = "Convert from PDF",
}: {
  excludeHref?: string;
  heading?: string;
}) {
  const items = CONVERT_FROM_PDF_TOOLS.filter((t) => t.href !== excludeHref);
  return (
    <section className="container-narrow py-12">
      <h2 className="text-center text-2xl font-bold text-ink-900 sm:text-left sm:text-3xl">
        {heading}
      </h2>
      <p className="mt-2 text-center text-sm text-ink-600 sm:text-left">
        Turn a PDF into Word, Excel, PowerPoint, plain text or JPG — free,
        browser-based, your file stays private.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group rounded-2xl border border-ink-100 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-pop"
          >
            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
              <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-brand-gradient text-lg text-white shadow-soft">
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
