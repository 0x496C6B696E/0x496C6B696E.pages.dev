"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Mail } from "lucide-react";
import { TechIcon } from "@/components/ui/TechIcon";
import { site } from "@/config/site";

const SUBJECT = encodeURIComponent("Summon sign from BonfireOS");
const BODY = encodeURIComponent("Hello,\n\nI found you through BonfireOS and ...");

function SummonSigil() {
  return (
    <svg viewBox="0 0 200 200" className="size-40 sm:size-48" aria-hidden="true">
      <defs>
        <radialGradient id="ss-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#f3d99b" stopOpacity="0.55" />
          <stop offset="0.6" stopColor="#e56c35" stopOpacity="0.12" />
          <stop offset="1" stopColor="#e56c35" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill="url(#ss-glow)" className="animate-breathe" />
      <circle cx="100" cy="100" r="78" fill="none" stroke="#d4af61" strokeOpacity="0.55" strokeWidth="1.2" />
      <circle cx="100" cy="100" r="62" fill="none" stroke="#d4af61" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 6" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const x1 = 100 + Math.cos(a) * 70;
        const y1 = 100 + Math.sin(a) * 70;
        const x2 = 100 + Math.cos(a) * 86;
        const y2 = 100 + Math.sin(a) * 86;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d4af61" strokeOpacity={i % 3 === 0 ? 0.9 : 0.45} strokeWidth={i % 3 === 0 ? 2 : 1} />;
      })}
      <path d="M100 52 L140 100 L100 148 L60 100 Z" fill="none" stroke="#f3d99b" strokeOpacity="0.7" strokeWidth="1.2" />
      <path d="M100 70 L100 130 M80 100 L120 100" stroke="#e56c35" strokeWidth="2" strokeLinecap="round" />
      <circle cx="100" cy="100" r="5" fill="#f3d99b" />
    </svg>
  );
}

type CopyState = "idle" | "copied" | "unavailable";

export function SummonSigns() {
  const [copy, setCopy] = useState<CopyState>("idle");

  useEffect(() => {
    if (copy !== "copied") return;
    const id = window.setTimeout(() => setCopy("idle"), 2200);
    return () => window.clearTimeout(id);
  }, [copy]);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(site.developer.email);
      setCopy("copied");
    } catch {
      setCopy("unavailable");
    }
  };

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[14rem_1fr]">
      <div className="flex justify-center lg:justify-start">
        <SummonSigil />
      </div>

      <div className="flex flex-col gap-4">
        <ul className="grid gap-4 sm:grid-cols-2">
          <li className="card card-interactive flex flex-col gap-3 p-5">
            <p className="eyebrow">Sign of the phantom</p>
            <h2 className="display flex items-center gap-2 text-lg text-ink">
              <TechIcon icon="siGithub" name="GitHub" className="size-5 text-flare" />
              GitHub
            </h2>
            <p className="font-mono text-sm text-ash">{site.developer.handle}</p>
            <p className="text-sm text-ash">Repositories, issues and pull requests. The best place for anything about the code.</p>
            <a href={site.developer.github} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-auto">
              Open profile
              <ExternalLink className="size-3.5" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>

          <li className="card card-interactive flex flex-col gap-3 p-5">
            <p className="eyebrow">Sign of the messenger</p>
            <h2 className="display flex items-center gap-2 text-lg text-ink">
              <TechIcon icon="siProton" name="Proton Mail" className="size-5 text-flare" />
              Proton Mail
            </h2>
            <p className="font-mono text-sm break-all text-ash" data-testid="email">
              {site.developer.email}
            </p>
            <p className="text-sm text-ash">Opens your own mail client with a subject already written. Nothing is sent from this page.</p>
            <div className="mt-auto flex flex-wrap gap-2">
              <a href={`mailto:${site.developer.email}?subject=${SUBJECT}&body=${BODY}`} className="btn btn-primary">
                <Mail className="size-3.5" aria-hidden="true" />
                Write
              </a>
              <button type="button" className="btn" onClick={copyAddress} aria-live="polite">
                {copy === "copied" ? <Check className="size-3.5 text-flare" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
                {copy === "copied" ? "Copied" : "Copy address"}
              </button>
            </div>
            {copy === "unavailable" && (
              <p className="text-xs text-ash" role="status">
                Clipboard access is blocked here. Select the address above to copy it.
              </p>
            )}
          </li>
        </ul>

        <p className="text-sm text-ash italic">“Leave a summon sign. I answer most of them.”</p>
        <p className="text-xs text-dust">
          Static site, zero cost: there is no contact form because there is no server to receive it. Both links above are verified from the public GitHub profile.
        </p>
      </div>
    </div>
  );
}
