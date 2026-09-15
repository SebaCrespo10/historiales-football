import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// recortes con URL propia (ver lib/historial-routes.ts) -- si se agrega una
// ruta nueva ahí, se refleja acá solo con importarla.
import { HISTORIAL_ROUTES } from "@/lib/historial-routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    ...HISTORIAL_ROUTES.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
