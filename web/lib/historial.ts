import { getFaseOptions, getLeadEvolution, getMatches, getSummary } from "./data";
import type { MatchFilters } from "./data";

const PAGE_SIZE = 10;

// "391 partidos desde 1908" para las meta descripciones: sale de BigQuery
// (consulta cacheada). Si BigQuery no responde (ej. durante el build) la
// descripción cae a una frase sin número en vez de romper la página.
export async function getTotalPartidosLabel(): Promise<string> {
  try {
    const { total } = await getMatches({ limit: 1 });
    return `${total} partidos`;
  } catch {
    return "todos los partidos";
  }
}

// carga compartida por la portada y por cada vista con filtro precargado
// (/copa-libertadores, /finales, etc.) -- todo resuelto en el servidor, nada
// depende de un fetch del lado del cliente para el primer render.
export async function getHistorialPageData(filters: MatchFilters = {}) {
  const [summary, { matches, total }, faseOptions, leadEvolution] = await Promise.all([
    getSummary(filters),
    getMatches({ ...filters, limit: PAGE_SIZE, offset: 0 }),
    getFaseOptions(),
    getLeadEvolution(filters),
  ]);

  return { summary, matches, total, faseOptions, leadEvolution };
}
