import { NextRequest, NextResponse } from "next/server";
import { getLeadEvolution } from "@/lib/data";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const fechaDesde = params.get("fechaDesde") ?? undefined;
  const fechaHasta = params.get("fechaHasta") ?? undefined;
  const torneo = params.get("torneo") ?? undefined;
  const fases = params.getAll("fase");
  const local = params.get("local") ?? undefined;
  const estadio = params.get("estadio") ?? undefined;
  const tipo = params.get("tipo") ?? undefined;
  const ganador = params.get("ganador") ?? undefined;
  const excludeAmistosos = params.get("excludeAmistosos") === "1";

  try {
    const points = await getLeadEvolution({
      fechaDesde,
      fechaHasta,
      torneo,
      fases,
      local,
      estadio,
      tipo,
      ganador,
      excludeAmistosos,
    });
    return NextResponse.json(points);
  } catch (error) {
    console.error("Error consultando BigQuery:", error);
    return NextResponse.json(
      { error: "No se pudo consultar la evolución del historial." },
      { status: 500 }
    );
  }
}
