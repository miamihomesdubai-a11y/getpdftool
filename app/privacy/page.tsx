import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How GetPDFTool handles your data. Spoiler: we do not upload your PDF files, and we explain exactly what we do collect.",
};

const LAST_UPDATED = "1 May 2026";

export default function PrivacyPage() {
  return (
    <article className="container-narrow prose prose-gray max-w-3xl py-12">
      <h1>Privacy Policy</h1>
      <p>
        <em>Last updated: {LAST_UPDATED}</em>
      </p>
      <p>
        This Privacy Policy explains what information GetPDFTool
        (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) collects when
        you visit <strong>www.getpdftool.com</strong> (the
        &ldquo;Service&rdquo;), how that information is used, and the choices
        you have. By using the Service you agree to this policy.
      </p>

      <h2>1. Your PDF files</h2>
      <p>
        The PDF files you open in our editor are processed entirely inside
        your web browser. They are <strong>not uploaded</strong> to our
        servers, not stored, not analysed by us, and not shared with anyone
        else. When you close the browser tab the file is gone from our side
        because it was never on our side.
      </p>

      <h2>2. Information we collect automatically</h2>
      <p>
        Like most websites, our hosting provider records standard request
        information when you load a page. This may include your IP address,
        browser type and version, operating system, the pages you visit, the
        time of your visit, and the referring URL. We use this to keep the
        Service running, to fix problems, and to understand which pages are
        useful.
      </p>

      <h2>3. Cookies and similar technologies</h2>
      <p>
        We use a small number of cookies and similar storage to make the
        Service work and to measure aggregate usage. Some of these cookies are
        set by third parties listed below.
      </p>

      <h2>4. Advertising and Google AdSense</h2>
      <p>
        GetPDFTool is supported by advertising. We use Google AdSense to
        display ads. Google and its partners may use cookies and similar
        technologies to serve ads based on your prior visits to this and other
        websites. You can opt out of personalised advertising by visiting{" "}
        <a
          href="https://www.google.com/settings/ads"
          rel="noopener noreferrer"
          target="_blank"
        >
          Google Ads Settings
        </a>{" "}
        or, for many other vendors, the{" "}
        <a
          href="https://www.aboutads.info/"
          rel="noopener noreferrer"
          target="_blank"
        >
          Digital Advertising Alliance
        </a>{" "}
        opt-out page.
      </p>
      <p>
        Third parties whose cookies may be set when you view ads are
        responsible for their own privacy practices; please consult their
        respective policies.
      </p>

      <h2>5. Analytics</h2>
      <p>
        We may use privacy-respecting analytics to understand which pages are
        most useful and how the Service performs. Where we use a third-party
        analytics provider, we configure it to anonymise IP addresses where
        that option is available.
      </p>

      <h2>6. Children</h2>
      <p>
        The Service is not directed to children under the age of 13, and we do
        not knowingly collect personal information from children. If you
        believe a child has provided us with personal information, please
        contact us so we can delete it.
      </p>

      <h2>7. Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access,
        correct, or delete personal information we hold about you, and to
        object to certain processing. Because we do not knowingly hold
        personal information that identifies you (beyond standard server
        logs), most requests are handled by clearing cookies and using opt-out
        tools listed above. To exercise any right or ask a question please
        contact{" "}
        <a href="mailto:privacy@getpdftool.com">privacy@getpdftool.com</a>.
      </p>

      <h2>8. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The date at the top of
        this page tells you when it was last revised. Continuing to use the
        Service after a change means you accept the updated policy.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about this policy or our privacy practices? Email{" "}
        <a href="mailto:privacy@getpdftool.com">privacy@getpdftool.com</a>.
      </p>
    </article>
  );
}
