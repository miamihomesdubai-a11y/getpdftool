import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of the GetPDFTool website and free PDF tools.",
};

const LAST_UPDATED = "1 May 2026";

export default function TermsPage() {
  return (
    <article className="container-narrow prose prose-gray max-w-3xl py-12">
      <h1>Terms of Service</h1>
      <p>
        <em>Last updated: {LAST_UPDATED}</em>
      </p>
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and
        use of <strong>www.getpdftool.com</strong> and the tools made
        available there (together, the &ldquo;Service&rdquo;). By using the
        Service you agree to these Terms. If you do not agree, please do not
        use the Service.
      </p>

      <h2>1. The Service</h2>
      <p>
        GetPDFTool provides free, browser-based tools for editing and
        managing PDF files. The processing of your files happens in your own
        browser; we do not upload, copy or retain your documents on our
        servers.
      </p>

      <h2>2. Acceptable use</h2>
      <p>You agree that you will not use the Service to:</p>
      <ul>
        <li>Upload, edit or distribute files that infringe the intellectual property rights of others;</li>
        <li>Process content that is unlawful, defamatory, obscene, or harmful to minors;</li>
        <li>Attempt to interfere with the operation of the Service, including by introducing malware or attempting to overload our infrastructure;</li>
        <li>Reverse-engineer, decompile or otherwise attempt to extract the source code of the Service except to the extent permitted by applicable law;</li>
        <li>Resell or commercially redistribute the Service without our written permission.</li>
      </ul>

      <h2>3. Your content</h2>
      <p>
        You retain all rights to the PDF files you process with the Service.
        We do not claim any ownership of your content. Because we do not
        receive your files, we have no copies of them.
      </p>

      <h2>4. Intellectual property</h2>
      <p>
        The Service, including its design, source code, graphics, logos, and
        original written content, is owned by GetPDFTool and protected by
        applicable intellectual-property laws. You may use the Service for its
        intended purpose but you may not copy, modify, or create derivative
        works of the Service without our written permission.
      </p>

      <h2>5. Third-party services</h2>
      <p>
        The Service displays advertising provided by third parties (including
        Google AdSense) and may link to third-party sites. We are not
        responsible for the content, privacy practices, or terms of any
        third-party site or service. Please review their policies before using
        them.
      </p>

      <h2>6. No warranty</h2>
      <p>
        The Service is provided <strong>as is</strong> and{" "}
        <strong>as available</strong>, without warranties of any kind, whether
        express or implied, including without limitation any warranties of
        merchantability, fitness for a particular purpose, or
        non-infringement. We do not guarantee that the Service will be
        uninterrupted, error-free, or that any defects will be corrected.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, GetPDFTool shall not be
        liable for any indirect, incidental, special, consequential or
        punitive damages, or any loss of profits or revenues, arising out of
        your use of, or inability to use, the Service. Because the Service is
        free, your sole remedy for dissatisfaction is to stop using it.
      </p>

      <h2>8. Indemnity</h2>
      <p>
        You agree to indemnify and hold harmless GetPDFTool and its
        operators from any claim or demand made by any third party arising
        out of your use of the Service or your violation of these Terms.
      </p>

      <h2>9. Changes to the Service or Terms</h2>
      <p>
        We may update the Service or these Terms at any time. When we make
        material changes to the Terms we will update the date at the top of
        this page. Your continued use after changes means you accept the
        revised Terms.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These Terms are governed by the laws of the jurisdiction in which the
        Service is operated, without regard to conflict-of-laws principles.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these Terms? Please email{" "}
        <a href="mailto:hello@getpdftool.com">hello@getpdftool.com</a>.
      </p>
    </article>
  );
}
