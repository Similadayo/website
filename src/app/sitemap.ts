import type { MetadataRoute } from "next";
import { ESSAYS } from "@/lib/essays";

const BASE = "https://labs.brancr.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes = [
    "",
    "/methodology",
    "/blueprint",
    "/sprint",
    "/reference-engagement",
    "/research",
    "/about",
    "/contact",
  ];

  const pages: MetadataRoute.Sitemap = routes.map((r) => ({
    url: `${BASE}${r}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: r === "" ? 1 : 0.7,
  }));

  const essays: MetadataRoute.Sitemap = ESSAYS.map((e) => ({
    url: `${BASE}/research/${e.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...pages, ...essays];
}
