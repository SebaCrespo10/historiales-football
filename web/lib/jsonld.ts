import type { Match } from "./data";
import { SITE_URL } from "./site";

const RIVER_TEAM = {
  "@type": "SportsTeam",
  name: "River Plate",
  sport: "Soccer",
} as const;

const BOCA_TEAM = {
  "@type": "SportsTeam",
  name: "Boca Juniors",
  sport: "Soccer",
} as const;

function matchToSportsEvent(m: Match) {
  return {
    "@type": "SportsEvent",
    name: `${m.local} vs ${m.visitante}`,
    startDate: m.fecha,
    sport: "Soccer",
    homeTeam: { "@type": "SportsTeam", name: m.local },
    awayTeam: { "@type": "SportsTeam", name: m.visitante },
    location: m.estadio ? { "@type": "Place", name: m.estadio } : undefined,
    superEvent: m.torneo,
  };
}

// JSON-LD de la portada: describe el dataset completo (para que los buscadores
// y motores de IA lo puedan citar como fuente) más los equipos y una muestra
// de partidos recientes como SportsEvent. Es una etiqueta invisible en el
// <head>/<body>, no cambia nada de lo que se ve.
export function buildHomeJsonLd(recentMatches: Match[]) {
  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Historial del Superclásico: River Plate vs Boca Juniors",
    description:
      "Historial completo, partido a partido, de todos los enfrentamientos oficiales y amistosos entre River Plate y Boca Juniors, validado contra los totales oficiales reportados por competencia.",
    url: SITE_URL,
    temporalCoverage: "1908-08-02/..",
    creator: { "@type": "Organization", name: "football-web" },
    variableMeasured: [
      "fecha",
      "torneo",
      "fase",
      "estadio",
      "equipo local",
      "equipo visitante",
      "resultado",
      "goles",
      "ganador",
    ],
    about: [RIVER_TEAM, BOCA_TEAM],
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Últimos Superclásicos disputados",
    itemListElement: recentMatches.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: matchToSportsEvent(m),
    })),
  };

  // Nota: FAQPage queda afuera a propósito -- Google penaliza datos
  // estructurados que no reflejan contenido visible en la página, y la
  // sección de FAQ visible todavía no está aprobada (queda para más
  // adelante). Se suma cuando esa sección exista.

  return [dataset, itemList];
}
