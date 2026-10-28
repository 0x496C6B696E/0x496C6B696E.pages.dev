import { BookMarked, Gem, Scroll, Shield, Signpost, Swords, type LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import type { Destination } from "@/config/site";

const ICONS: Record<Destination["icon"], ComponentType<LucideProps>> = {
  scroll: Scroll,
  swords: Swords,
  book: BookMarked,
  shield: Shield,
  gem: Gem,
  signpost: Signpost,
};

export function DestinationIcon({ icon, ...props }: { icon: Destination["icon"] } & LucideProps) {
  const Icon = ICONS[icon];
  return <Icon aria-hidden="true" {...props} />;
}
