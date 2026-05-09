import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the GetPDFTool team — for support, feedback, partnership requests, or anything else.",
};

export default function ContactPage() {
  return (
    <article className="container-narrow prose prose-gray max-w-3xl py-12">
      <h1>Contact us</h1>
      <p>
        We would love to hear from you. Whether you have a question, a bug
        report, a feature idea, or a partnership proposal, please use one of
        the methods below and we will respond as soon as we can.
      </p>

      <h2>Email</h2>
      <p>
        General questions and support:{" "}
        <a href="mailto:hello@getpdftool.com">hello@getpdftool.com</a>
      </p>
      <p>
        Privacy and legal:{" "}
        <a href="mailto:privacy@getpdftool.com">privacy@getpdftool.com</a>
      </p>

      <h2>Mailing address</h2>
      <p>
        If you need to reach us by post, please email us first and we will
        share the correct mailing address for your enquiry.
      </p>

      <h2>Response times</h2>
      <p>
        We aim to reply to every message within two business days. Bug reports
        that include the browser you are using and a short description of what
        you were doing when the problem occurred are especially helpful.
      </p>

      <h2>A note on uploads</h2>
      <p>
        Please do not email us your PDF files. We never need to see them, and
        we do not want copies of private documents to sit in our inbox. If you
        are reporting a problem with a specific file, a screenshot or a short
        written description of what went wrong is enough.
      </p>
    </article>
  );
}
