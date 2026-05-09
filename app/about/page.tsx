import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "GetPDFTool is an independent web app that gives everyone free, private, browser-based PDF tools. Learn what we build and why.",
};

export default function AboutPage() {
  return (
    <article className="container-narrow prose prose-gray max-w-3xl py-12">
      <h1>About GetPDFTool</h1>
      <p>
        GetPDFTool is an independent online toolkit for editing and managing
        PDF files. Our goal is simple: give everyone — students, teachers,
        freelancers, small businesses and curious people — a fast, private,
        and genuinely free way to work with PDF documents in any modern web
        browser.
      </p>

      <h2>What we believe</h2>
      <p>
        Most PDF editors either cost money, force you to create an account, or
        upload your private documents to a remote server. We think there is a
        better way. GetPDFTool runs the entire editor inside your own browser
        using modern web standards, so the document you open stays on your
        device. Nothing is sent to us, nothing is stored on our side, and
        nothing is shared with anyone else.
      </p>

      <h2>How we keep the lights on</h2>
      <p>
        Building, hosting and maintaining a free web app is not cost-free, so
        we display advertising on the site. The ads are clearly labelled and
        kept separate from the editor controls so they never interfere with
        your work. We do not sell your data, and we do not use your PDF
        contents to target ads — because we never see your PDF in the first
        place.
      </p>

      <h2>What we are working on</h2>
      <p>
        Today the homepage gives you a complete PDF editor: add text, draw,
        highlight, rotate or delete pages, and download the finished file.
        Coming next are more tools — merge, split, compress, convert and sign
        — each built with the same in-browser, privacy-first approach.
      </p>

      <h2>Get in touch</h2>
      <p>
        Found a bug, want to suggest a feature, or just want to say hello?
        Please use the <a href="/contact">contact page</a>. Real humans read
        every message.
      </p>
    </article>
  );
}
