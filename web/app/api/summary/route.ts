import { NextRequest, NextResponse } from "next/server";
import { getSummary } from "@/lib/data";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const fecha = params.get("fecha") ?? undefined;
  const torneo = params.get("torneo") ?? undefined;
  const fase = params.get("fase") ?? undefined;
  const local = params.get("local") ?? undefined;
  const estadio = params.get("estadio") ?? undefined;
  const tipo = params.get("tipo") ?? undefined;
  const ganador = params.get("ganador") ?? undefined;

  try {
    const summary = await getSummary({
      fecha,
      torneo,
      fase,
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
