import type { MetadataRoute } from "next";
import { destinations, site } from "@/config/site";
import { quests } from "@/data/projects";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: site.url, lastModified, changeFrequency: "monthly", priority: 1 },
    ...destinations.map((d) => ({ url: `${site.url}${d.path}`, lastModified, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...quests.map((q) => ({ url: `${site.url}/projects/${q.slug}`, lastModified, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
