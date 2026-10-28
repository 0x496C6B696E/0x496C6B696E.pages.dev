import type { Metadata } from "next";
import { Panel } from "@/components/ui/Panel";
import { MailChannels } from "@/components/contact/MailChannels";

export const metadata: Metadata = {
  title: "Mail · Contact",
  description: "Reach 0x496C6B696E through GitHub or Proton Mail. No forms, no trackers, no backend.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <Panel slug="contact" title="Mail" lede="Two verified channels. Pick one.">
      <MailChannels />
    </Panel>
  );
}
