import { NextRequest, NextResponse } from "next/server";
import { getSummary } from "@/lib/data";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const tipos = params.getAll("tipo");
  const ganadores = params.getAll("ganador");
  const search = params.get("q") ?? undefined;

  try {
    const summary = await getSummary({ tipos, ganadores, search });
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error consultando BigQuery:", error);
    return NextResponse.json(
      { error: "No se pudo consultar el resumen." },
      { status: 500 }
    );
  }
}
