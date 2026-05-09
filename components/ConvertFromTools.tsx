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
      <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
        {heading}
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        Turn a PDF into Word, Excel, PowerPoint, plain text or JPG — free,
        browser-based, your file stays private.
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
