"use client";

import { useState } from "react";
import { github } from "@/data/github";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * The GitHub avatar, loaded live from GitHub's avatar CDN (keyed by user id) so it follows the
 * account without a redeploy. The copy saved at build time (`/avatar.jpg`, refreshed by
 * scripts/fetch-github.mjs) is the fallback if the CDN is unreachable or blocked.
 */
export function Avatar({ size, className, priority }: { size: number; className?: string; priority?: boolean }) {
  const live = github.user?.avatarUrl ? `${github.user.avatarUrl}${github.user.avatarUrl.includes("?") ? "&" : "?"}s=${size * 2}` : null;
  const [src, setSrc] = useState(live ?? "/avatar.jpg");
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a live external image; next/image needs a fixed loader
    <img
      src={src}
      alt={`GitHub avatar of ${site.developer.handle}`}
      width={size}
      height={size}
      className={cn("object-cover", className)}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (src !== "/avatar.jpg") setSrc("/avatar.jpg");
      }}
    />
  );
}
