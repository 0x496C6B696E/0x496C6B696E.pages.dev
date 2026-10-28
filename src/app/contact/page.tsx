import type { Metadata } from "next";
import { Panel } from "@/components/ui/Panel";
import { SummonSigns } from "@/components/contact/SummonSigns";

export const metadata: Metadata = {
  title: "Summon Signs · Contact",
  description: "Reach 0x496C6B696E through GitHub or Proton Mail. No forms, no trackers, no backend.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <Panel slug="contact" title="Summon Signs" lede="Two signs are placed at this camp. Touch one to reach across.">
      <SummonSigns />
    </Panel>
  );
}
