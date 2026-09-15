import { NextRequest, NextResponse } from "next/server";
import { getMatches } from "@/lib/data";

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
  const limit = Number(params.get("limit") ?? "10");
  const offset = Number(params.get("offset") ?? "0");

  try {
    const result = await getMatches({
      fechaDesde,
      fechaHasta,
      torneo,
      fases,
      local,
      estadio,
      tipo,
      ganador,
      limit,
      offset,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error consultando BigQuery:", error);
    return NextResponse.json(
      { error: "No se pudo consultar el historial." },
      { status: 500 }
    );
  }
}
