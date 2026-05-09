import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Replace with your real AdSense publisher ID once approved by Google.
// Example: "ca-pub-1234567890123456"
const ADSENSE_CLIENT = "";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.getpdftool.com"),
  title: {
    default: "GetPDFTool — All Free PDF Editor Plus More",
    template: "%s | GetPDFTool",
  },
  description:
    "Free online PDF editor and tools. Edit, merge, split, compress, convert PDFs in your browser — fast, secure, no signup. 100% free.",
  keywords: [
    "free PDF editor",
    "edit PDF online",
    "PDF tools",
    "merge PDF",
    "split PDF",
    "compress PDF",
    "annotate PDF",
    "sign PDF",
    "GetPDFTool",
  ],
  authors: [{ name: "GetPDFTool" }],
  openGraph: {
    title: "GetPDFTool — All Free PDF Editor Plus More",
    description:
      "Free online PDF editor. Add text, draw, highlight, rotate, delete pages, and download — all in your browser.",
    url: "https://www.getpdftool.com",
    siteName: "GetPDFTool",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GetPDFTool — All Free PDF Editor Plus More",
    description:
      "Free online PDF editor. Edit in your browser — no signup, no upload to servers.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800;900&family=Caveat:wght@400;700&family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Pacifico&family=Sacramento&family=Satisfy&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-ink-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {ADSENSE_CLIENT && (
          <Script
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
      </body>
    </html>
  );
}
