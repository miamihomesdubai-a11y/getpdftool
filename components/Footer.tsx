import Link from "next/link";

const products = [["/", "Editor"], ["/organise", "Organise pages"], ["/merge-pdf", "Merge PDF"], ["/compress-pdf", "Compress PDF"], ["/sign-pdf", "Sign PDF"]];
const conversions = [["/pdf-to-word", "PDF to Word"], ["/word-to-pdf", "Word to PDF"], ["/pdf-to-excel", "PDF to Excel"], ["/excel-to-pdf", "Excel to PDF"], ["/pdf-to-powerpoint", "PDF to PowerPoint"], ["/pdf-to-jpg", "PDF to JPG"], ["/jpeg-to-pdf", "Images to PDF"], ["/html-to-pdf", "HTML to PDF"]];

export default function Footer() {
  return (
    <footer className="mt-16 bg-ink-900 text-white">
      <div className="container-narrow grid gap-9 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div><h2 className="font-display text-xl font-bold">GetPDFTool</h2><p className="mt-3 text-sm leading-relaxed text-white/75">Free PDF tools that process your documents in your browser. No account required.</p><Link href="/privacy" className="mt-4 inline-block text-sm text-brand-200 underline">How document privacy works</Link></div>
        {[{ title: "PDF tools", links: products }, { title: "Convert files", links: conversions }].map(group => (
          <div key={group.title}><h2 className="text-sm font-bold uppercase tracking-wider">{group.title}</h2><ul className="mt-4 space-y-2.5 text-sm text-white/75">{group.links.map(([href, label]) => <li key={href}><Link href={href} className="hover:text-white hover:underline">{label}</Link></li>)}</ul></div>
        ))}
        <div><h2 className="text-sm font-bold uppercase tracking-wider">Practical help</h2><p className="mt-3 text-sm leading-relaxed text-white/75">Find step-by-step workflows, examples and limitations before choosing a tool.</p><Link href="/guides" className="mt-4 inline-block rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold hover:bg-brand-700">Browse PDF guides</Link><p className="mt-5 text-sm text-white/75">Questions or a bug report? <Link href="/contact" className="underline hover:text-white">Contact support</Link>.</p></div>
      </div>
      <div className="border-t border-white/10"><div className="container-narrow flex flex-col gap-4 py-5 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} GetPDFTool. All rights reserved.</p><nav aria-label="Footer information" className="flex flex-wrap gap-5">{[["/about", "About"], ["/contact", "Contact"], ["/privacy", "Privacy"], ["/terms", "Terms"]].map(([href, label]) => <Link key={href} href={href} className="hover:text-white hover:underline">{label}</Link>)}</nav></div></div>
    </footer>
  );
}
