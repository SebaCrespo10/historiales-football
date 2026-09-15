import { getHistorialPageData } from "@/lib/historial";
import { getHistorialRoute } from "@/lib/historial-routes";
import { HistorialPage } from "./HistorialPage";

// server component compartido por cada recorte con URL propia
// (/copa-libertadores, /finales, etc.) -- busca su config por path y resuelve
// los datos en el servidor, igual que la portada.
export async function HistorialRoutePage({ path }: { path: string }) {
  const route = getHistorialRoute(path);
  const { summary, matches, total, faseOptions, leadEvolution } = await getHistorialPageData(
    route.filters
  );

  return (
    <HistorialPage
      summary={summary}
      matches={matches}
      total={total}
      faseOptions={faseOptions}
      leadEvolution={leadEvolution}
      initialFilters={route.filters}
    />
  );
}
