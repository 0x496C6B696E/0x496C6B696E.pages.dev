"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { TechIcon } from "@/components/ui/TechIcon";
import { site } from "@/config/site";

const SUBJECT = encodeURIComponent("Hello from your portfolio");
const BODY = encodeURIComponent("Hello,\n\nI found you through your portfolio site and ...");

type CopyState = "idle" | "copied" | "unavailable";

export function MailChannels() {
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
    <div className="grid items-start gap-8 lg:grid-cols-[18rem_1fr]">
      <pre className="card overflow-x-auto p-5 font-mono text-[0.78rem] leading-7 text-ash" aria-label="Contact summary">
        <span className="text-glow">$ cat mail.msg</span>
        {"\n"}channels   <span className="text-ink">2</span> (github, email)
        {"\n"}forms      <span className="text-ink">0</span>
        {"\n"}trackers   <span className="text-ink">0</span>
        {"\n"}backend    <span className="text-ink">none</span>
        {"\n"}reply      <span className="text-ink">&quot;I answer most of them.&quot;</span>
      </pre>

      <div className="flex flex-col gap-4">
        <ul className="grid gap-4 sm:grid-cols-2">
          <li className="card card-interactive flex flex-col gap-3 p-5">
            <p className="eyebrow">channel 01 · code</p>
            <h2 className="display flex items-center gap-2 text-lg text-ink">
              <TechIcon icon="siGithub" name="GitHub" className="size-5 text-glow" />
              GitHub
            </h2>
            <p className="font-mono text-sm text-ash">{site.developer.handle}</p>
            <p className="text-sm text-ash">Repositories, issues and pull requests. The best place for anything about the code.</p>
            <Link href="/browser" className="btn btn-primary mt-auto">
              Open profile
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </li>

          <li className="card card-interactive flex flex-col gap-3 p-5">
            <p className="eyebrow">channel 02 · direct</p>
            <h2 className="display flex items-center gap-2 text-lg text-ink">
              <TechIcon icon="siProton" name="Proton Mail" className="size-5 text-glow" />
              Email
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
                {copy === "copied" ? <Check className="size-3.5 text-glow" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
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

        <p className="text-xs text-dust">Static site, zero cost: there is no contact form because there is no server to receive it. Both links are taken from the public GitHub profile.</p>
      </div>
    </div>
  );
}
