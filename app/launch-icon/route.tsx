/**
 * 240×240 PNG product icon for ProductHunt (and any other directory
 * that asks for a square thumbnail in that size). Served at
 * /launch-icon — visit the URL, right-click → "Save image as..." to
 * download.
 *
 * Generated server-side via @vercel/og so we can tweak the design
 * without round-tripping through a design tool.
 */
import { ImageResponse } from "next/og";

export const runtime = "edge";

const SIZE = 240;

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #dc2626 0%, #b91c1c 60%, #991b1b 100%)",
          position: "relative",
        }}
      >
        {/* Subtle decorative blob to give the icon some depth */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: 999,
            background: "rgba(255,255,255,0.10)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 140,
            height: 140,
            borderRadius: 999,
            background: "rgba(0,0,0,0.10)",
            display: "flex",
          }}
        />

        {/* Centered brand mark */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontFamily: "sans-serif",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              letterSpacing: -3,
              lineHeight: 1,
              display: "flex",
            }}
          >
            PDF
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              opacity: 0.9,
              display: "flex",
            }}
          >
            TOOL
          </div>
        </div>

        {/* Small edit badge — bottom-right corner */}
        <div
          style={{
            position: "absolute",
            right: 18,
            bottom: 18,
            width: 36,
            height: 36,
            borderRadius: 999,
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#dc2626",
            fontSize: 22,
            fontWeight: 900,
          }}
        >
          ✎
        </div>
      </div>
    ),
    { width: SIZE, height: SIZE }
  );
}
