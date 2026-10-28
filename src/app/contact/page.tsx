import type { Metadata } from "next";
import { AppWindow } from "@/components/ui/AppWindow";
import { MailChannels } from "@/components/contact/MailChannels";

export const metadata: Metadata = {
  title: "Mail · Contact",
  description: "Reach 0x496C6B696E through GitHub or Proton Mail. No forms, no trackers, no backend.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <AppWindow slug="contact" title="Mail" lede="Two verified channels. Pick one.">
      <MailChannels />
    </AppWindow>
  );
}
