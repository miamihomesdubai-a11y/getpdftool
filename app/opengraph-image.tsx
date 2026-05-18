/**
 * Dynamic Open Graph image for the homepage and site-wide fallback.
 *
 * Next.js renders this on the server with @vercel/og's edge runtime
 * and serves it as a PNG at /opengraph-image (and also picks it up
 * as the default OG image for the root route). Beats shipping a
 * 200 KB static PNG and means we can iterate on the design without
 * a designer.
 */
import { ImageResponse } from "next/og";

export const runtime = "edge";

// Spec: og:image should be 1200×630, < 8 MB.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "GetPDFTool — Free online PDF editor";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, #fee2e2 0%, transparent 45%), radial-gradient(circle at 10% 85%, #fef2f2 0%, transparent 50%)",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top — brand chip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            backgroundColor: "#fee2e2",
            color: "#b91c1c",
            padding: "10px 22px",
            borderRadius: 999,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          ★ All Free PDF Editor Plus More
        </div>

        {/* Middle — hero headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: "#0f172a",
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              letterSpacing: -3,
              lineHeight: 1,
            }}
          >
            Edit any PDF —
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              letterSpacing: -3,
              lineHeight: 1,
              color: "#dc2626",
              marginTop: 8,
            }}
          >
            right in your browser
          </div>
          <div
            style={{
              fontSize: 34,
              color: "#475569",
              marginTop: 24,
              maxWidth: 900,
            }}
          >
            Merge · Split · Compress · Sign · Convert — no signup, no
            uploads.
          </div>
        </div>

        {/* Bottom — URL + tagline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            color: "#0f172a",
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 56,
                height: 56,
                backgroundColor: "#dc2626",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 32,
                fontWeight: 900,
              }}
            >
              PDF
            </div>
            getpdftool.com
          </div>
          <div style={{ color: "#94a3b8", fontSize: 26, fontWeight: 500 }}>
            100% Private · Forever Free
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
