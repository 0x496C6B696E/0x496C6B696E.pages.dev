import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ExternalLink, Lock, RotateCw } from "lucide-react";
import { AppWindow } from "@/components/ui/AppWindow";
import { GitHubProfile } from "@/components/browser/GitHubProfile";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "GitHub — Firefox",
  description: `${site.developer.handle} on GitHub, opened in the workstation's browser: profile, pinned projects, recent repositories and languages.`,
  alternates: { canonical: "/browser" },
};

const url = site.developer.github;
const pretty = url.replace(/^https?:\/\//, "");

/** The browser window: a Firefox-style toolbar over the GitHub profile. */
export default function BrowserPage() {
  return (
    <AppWindow
      chrome={{ name: pretty, app: "Firefox", crumbs: [] }}
      toolbar={
        <div className="win-tools browser-bar" role="group" aria-label="Browser toolbar">
          <span className="browser-nav" aria-hidden="true">
            <ArrowLeft className="size-4" />
            <ArrowRight className="size-4 opacity-40" />
            <RotateCw className="size-3.5" />
          </span>
          <span className="browser-url">
            <Lock className="size-3 shrink-0 text-ok" aria-hidden="true" />
            <span className="truncate">{pretty}</span>
          </span>
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm shrink-0" title="Open github.com in a new tab">
            <ExternalLink className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">github.com</span>
            <span className="sr-only">Open the real profile in a new tab</span>
          </a>
        </div>
      }
      title="GitHub"
      lede="The public profile, as the workstation sees it. Pinned projects open their windows here; github.com itself is one click away."
      wide
    >
      <GitHubProfile />
    </AppWindow>
  );
}
