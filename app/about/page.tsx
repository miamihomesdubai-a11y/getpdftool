import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "About GetPDFTool", description: "Learn what GetPDFTool does, how browser-based document processing works, and the limits of its free PDF tools." };
export default function AboutPage() {
  return <article className="container-narrow prose prose-gray max-w-3xl py-12">
    <h1>About GetPDFTool</h1>
    <p>GetPDFTool is an independent collection of free PDF tools for students, teachers, freelancers and small businesses. The aim is to make everyday document tasks easier without requiring an account or sending document files to our servers for processing.</p>
    <h2>What you can do today</h2>
    <p>Use the editor to add text, notes, highlights and drawings. The organiser can merge PDFs, add, delete, copy, reorder and rotate pages. Other tools compress files, place signature images and watermarks, convert PDF pages to images, and extract existing PDF text into Word, Excel or plain-text files. Word, Excel, JPEG, PNG and HTML conversion tools can create PDFs.</p>
    <h2>Choose a tool for the result you need</h2>
    <p>Conversion involves trade-offs. PDF to Word extracts text into editable paragraphs; it does not reconstruct an exact Word layout or read image-only scans. PDF to PowerPoint creates image-based slides, not separately editable text. Some compression settings turn pages into images. Our <Link href="/guides">practical PDF guides</Link> explain these limits with worked examples so you can choose an appropriate workflow.</p>
    <h2>How document privacy works</h2>
    <p>Document processing runs in your browser. Opening a PDF in a tool does not upload it to our servers. The website still makes ordinary network requests to load pages, software libraries and third-party services. Embedded videos and advertising providers can receive information about page visits. HTML files can also reference remote resources. Read the <Link href="/privacy">Privacy Policy</Link> for the distinction between document contents and website usage data.</p>
    <h2>Free tools and advertising</h2>
    <p>The tools currently available on this website are free. Advertising may help support hosting and maintenance. An advertisement is not a tool control, a download requirement or an endorsement of a third-party service. The presence of an advertising script does not mean that Google has approved or endorsed this website.</p>
    <h2>Check your result</h2>
    <p>Keep your original files and review every downloaded result before sharing. Complex layouts, protected files, digital signatures, fonts and interactive form fields may need a specialist application. A visible signature image is not a certificate-based digital signature, and covering text with a drawing is not secure redaction.</p>
    <h2>Support and feedback</h2>
    <p>Use our <Link href="/contact">contact page</Link> to report a problem. Include the tool, browser version and a description of what happened. Please do not send private documents, identity records or your signature image. We do not publish a user rating or user-count claim without a verifiable source.</p>
  </article>;
}
