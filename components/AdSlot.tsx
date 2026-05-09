"use client";

import { useEffect, useRef } from "react";

/**
 * Reusable Google AdSense slot.
 *
 * Until you replace ADSENSE_CLIENT and pass a real `slot` ID from your
 * AdSense dashboard, this renders a clean placeholder so you can see the
 * layout. Once you swap in real values, real ads appear.
 */

// e.g. "ca-pub-1234567890123456"
const ADSENSE_CLIENT = "";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Props = {
  slot?: string; // your AdSense ad slot ID
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  responsive?: boolean;
  label?: string;
  className?: string;
};

export default function AdSlot({
  slot,
  format = "auto",
  responsive = true,
  label = "Advertisement",
  className = "",
}: Props) {
  const isLive = Boolean(ADSENSE_CLIENT && slot);
  const pushed = useRef(false);

  useEffect(() => {
    if (!isLive || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (err) {
      console.error("AdSense push failed:", err);
    }
  }, [isLive]);

  return (
    <aside
      aria-label="Advertisement"
      className={`my-6 flex flex-col items-center ${className}`}
    >
      <span className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600/70">
        {label}
      </span>
      {isLive ? (
        <ins
          className="adsbygoogle block w-full"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
        />
      ) : (
        <div className="grid h-24 w-full max-w-3xl place-items-center rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 text-xs text-brand-500/80">
          Ad space — set ADSENSE_CLIENT in components/AdSlot.tsx and pass a
          slot prop
        </div>
      )}
    </aside>
  );
}
