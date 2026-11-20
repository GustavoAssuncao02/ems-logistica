import type { MetadataRoute } from "next";
import { pagesBuild, site } from "@/config/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/cotacao", priority: 0.9 },
    { path: "/contato", priority: 0.7 },
    { path: "/trabalhe-conosco", priority: 0.6 },
    { path: "/politica-de-privacidade", priority: 0.3 },
  ];
  return routes.map(({ path, priority }) => {
    const pathname = path === "/" ? "" : path;
    return {
      url: `${site.url}${pathname}${pagesBuild ? "/" : ""}`,
      changeFrequency: "monthly",
      priority,
    };
  });
}
