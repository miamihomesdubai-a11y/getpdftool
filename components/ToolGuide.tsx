import Link from "next/link";
import { TOOL_GUIDES } from "@/lib/toolGuides";

export default function ToolGuide({ tool }: { tool: string }) {
  const guide = TOOL_GUIDES[tool];
  if (!guide) return null;
  return (
    <section className="container-narrow py-10" aria-labelledby="tool-guide-heading">
      <div className="rounded-3xl border border-brand-200 bg-white p-6 shadow-soft sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Practical guide</p>
        <h2 id="tool-guide-heading" className="mt-2 text-2xl font-bold text-ink-900">{guide.title}</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-ink-600">{guide.intro}</p>
        <div className="mt-7 grid gap-7 lg:grid-cols-2">
          <div>
            <h3 className="font-semibold text-ink-900">Step by step</h3>
            <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-ink-700">
              {guide.steps.map(step => <li key={step}>{step}</li>)}
            </ol>
          </div>
          <div className="rounded-2xl bg-brand-50 p-5">
            <h3 className="font-semibold text-ink-900">Before you start</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-700">{guide.limit}</p>
            <h3 className="mt-5 font-semibold text-ink-900">Example workflow</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">{guide.example}</p>
          </div>
        </div>
        <h3 className="mt-7 font-semibold text-ink-900">If the result is not what you expected</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-700">{guide.help}</p>
        <p className="mt-5 border-t border-ink-100 pt-4 text-sm leading-relaxed text-ink-600">
          Keep your original file and check the downloaded result before sharing. Large files may exceed your browser’s memory. Need help? <Link href="/contact" className="font-semibold text-brand-700 underline">Contact us</Link> with the tool name and your browser version; please do not send private documents.
        </p>
      </div>
    </section>
  );
}
