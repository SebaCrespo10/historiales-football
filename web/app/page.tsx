import type { Metadata } from "next";
import { getHistorialPageData } from "@/lib/historial";
import { HistorialPage } from "@/components/HistorialPage";
import { JsonLd } from "@/components/JsonLd";
import { buildHomeJsonLd } from "@/lib/jsonld";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Superclásico | Historial River - Boca",
  description:
    "Historial completo del Superclásico entre River Plate y Boca Juniors: 391 partidos desde 1908, filtrable por torneo, fase, estadio y resultado, con un gráfico de la evolución del historial partido a partido.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const { summary, matches, total, faseOptions, leadEvolution } = await getHistorialPageData();

  return (
    <>
      <JsonLd data={buildHomeJsonLd(matches)} />
      <HistorialPage
        summary={summary}
        matches={matches}
        total={total}
        faseOptions={faseOptions}
        leadEvolution={leadEvolution}
      />
    </>
  );
}
