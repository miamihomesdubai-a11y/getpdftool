"use client";

import { useEffect, useRef } from "react";

/**
 * Reusable Google AdSense slot.
 *
 * Renders a real ad ONLY when both ADSENSE_CLIENT and a per-slot ID
 * are configured. Until then it renders nothing — visitors see no
 * placeholder, no dashed box, no developer message. Once AdSense
 * approves the site and you create ad units in the AdSense dashboard,
 * pass each unit's slot ID via the `slot` prop on the relevant
 * <AdSlot> placement and the ad appears automatically.
 */

// Same publisher ID as app/layout.tsx — kept in sync so a single
// AdSense account drives both the page-level loader and individual
// ad units.
const ADSENSE_CLIENT = "ca-pub-2575111126579327";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Props = {
  /** AdSense ad slot ID — created in the AdSense dashboard after
   *  account approval. Until you pass this, the slot renders nothing. */
  slot?: string;
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

  // No slot configured yet → render nothing. Keeps the live site
  // clean during AdSense review and before ad units are created.
  if (!isLive) return null;

  return (
    <aside
      aria-label="Advertisement"
      className={`my-6 flex flex-col items-center ${className}`}
    >
      <span className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600/70">
        {label}
      </span>
      <ins
        className="adsbygoogle block w-full"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </aside>
  );
}
