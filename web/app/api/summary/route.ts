import { NextRequest, NextResponse } from "next/server";
import { getSummary } from "@/lib/data";

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

  try {
    const summary = await getSummary({
      fechaDesde,
      fechaHasta,
      torneo,
      fases,
      local,
      estadio,
      tipo,
      ganador,
    });
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error consultando BigQuery:", error);
    return NextResponse.json(
      { error: "No se pudo consultar el resumen." },
      { status: 500 }
    );
  }
}
