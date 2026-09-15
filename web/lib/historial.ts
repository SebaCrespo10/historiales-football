import { getFaseOptions, getLeadEvolution, getMatches, getSummary } from "./data";
import type { MatchFilters } from "./data";

const PAGE_SIZE = 10;

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
