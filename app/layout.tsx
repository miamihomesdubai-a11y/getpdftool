import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ldScriptProps,
  organizationJsonLd,
  webSiteJsonLd,
} from "@/lib/seo";

// Replace with your real AdSense publisher ID once approved by Google.
// Example: "ca-pub-1234567890123456"
const ADSENSE_CLIENT = "";

// Google Analytics 4 measurement ID — see
// https://analytics.google.com/ for your property.
const GA_MEASUREMENT_ID = "G-DF4N5HX317";

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
    // Next.js auto-discovers app/opengraph-image.tsx and emits the
    // correct og:image / og:image:width / og:image:height tags — no
    // need to hard-code a URL here.
  },
  twitter: {
    card: "summary_large_image",
    title: "GetPDFTool — All Free PDF Editor Plus More",
    description:
      "Free online PDF editor. Edit in your browser — no signup, no upload to servers.",
  },
  robots: {
    index: true,
    follow: true,
    // Help Google generate rich snippets — explicit allow.
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
        {/* Sitewide structured data — Organization + WebSite. Powers
            the knowledge-panel + sitelinks-search-box rich results. */}
        <script {...ldScriptProps(organizationJsonLd())} />
        <script {...ldScriptProps(webSiteJsonLd())} />

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
        {/* Google Analytics 4 — gtag.js. Loaded after interactive so
            it doesn't block first paint. Two scripts: the gtag library
            itself, then the inline config call. */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              async
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
