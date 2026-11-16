import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/cotacao", priority: 0.9 },
    { path: "/contato", priority: 0.7 },
    { path: "/trabalhe-conosco", priority: 0.6 },
    { path: "/politica-de-privacidade", priority: 0.3 },
  ];
  return routes.map((r) => ({
    url: `${site.url}${r.path === "/" ? "" : r.path}`,
    changeFrequency: "monthly",
    priority: r.priority,
  }));
}
