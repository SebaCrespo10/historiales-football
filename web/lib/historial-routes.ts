import type { MatchFilters } from "./data";

export type HistorialRoute = {
  path: string;
  filters: MatchFilters;
  title: string;
  description: string;
};

// recortes del historial con URL propia: misma tabla, mismo diseño, con un
// filtro precargado -- pensados para las búsquedas de mayor volumen/intención
// que hoy solo viven como estado de filtro sobre la portada.
export const HISTORIAL_ROUTES: HistorialRoute[] = [
  {
    path: "/copa-libertadores",
    filters: { tipo: "Copa Internacional" },
    title: "Superclásico en copas internacionales",
    description:
      "Todos los Superclásicos entre River Plate y Boca Juniors por Copa Libertadores y otras copas internacionales: resultados, fechas y quién ganó.",
  },
  {
    path: "/finales",
    filters: { fases: ["Final", "Final (Ida)", "Final (Vuelta)"] },
    title: "Finales del Superclásico",
    description:
      "Todas las finales que se definieron entre River Plate y Boca Juniors, con fecha, torneo, estadio y resultado de cada una.",
  },
  {
    path: "/river-de-visitante",
    filters: { local: "Boca Juniors" },
    title: "River de visitante ante Boca",
    description:
      "Historial del Superclásico jugado en cancha de Boca Juniors: todos los partidos donde River Plate fue visitante.",
  },
  {
    path: "/boca-de-visitante",
    filters: { local: "River Plate" },
    title: "Boca de visitante ante River",
    description:
      "Historial del Superclásico jugado en cancha de River Plate: todos los partidos donde Boca Juniors fue visitante.",
  },
  {
    path: "/amistosos",
    filters: { tipo: "Amistoso" },
    title: "Superclásicos amistosos",
    description:
      "Todos los partidos amistosos disputados entre River Plate y Boca Juniors, fuera de los torneos oficiales.",
  },
  {
    path: "/sin-amistosos",
    filters: { excludeAmistosos: true },
    title: "Superclásicos oficiales",
    description:
      "Historial del Superclásico entre River Plate y Boca Juniors en torneos oficiales, sin contar partidos amistosos.",
  },
];

export function getHistorialRoute(path: string): HistorialRoute {
  const route = HISTORIAL_ROUTES.find((r) => r.path === path);
  if (!route) throw new Error(`Ruta de historial no configurada: ${path}`);
  return route;
}
