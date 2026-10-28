import type { Metadata } from "next";
import { AppWindow } from "@/components/ui/AppWindow";
import { ToolchainPanel } from "@/components/stack/ToolchainPanel";

export const metadata: Metadata = {
  title: "Toolchain · Tech Stack",
  description: "Languages, frameworks, infrastructure and tools in use: Python, TypeScript, Rust, C, Django, FastAPI, n8n, Linux, Docker, Kubernetes, PostgreSQL, Redis and more, each tied to where it was used.",
  alternates: { canonical: "/stack" },
};

export default function StackPage() {
  return (
    <AppWindow slug="stack" title="Toolchain" lede="Select an entry to read what it is for and where it has been used." wide>
      <ToolchainPanel />
      <p className="mt-8 text-xs text-dust">
        Brand icons by{" "}
        <a href="https://simpleicons.org" target="_blank" rel="noopener noreferrer" className="underline decoration-accent/40 underline-offset-4 hover:text-glow">
          Simple Icons
        </a>{" "}
        (CC0 1.0). Entries without an icon show a two-letter monogram. Only technologies present in the public profile or repositories are listed.
      </p>
    </AppWindow>
  );
}
