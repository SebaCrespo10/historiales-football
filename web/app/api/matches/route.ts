import { NextRequest, NextResponse } from "next/server";
import { getMatches } from "@/lib/data";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const tipos = params.getAll("tipo");
  const ganadores = params.getAll("ganador");
  const search = params.get("q") ?? undefined;
  const limit = Number(params.get("limit") ?? "10");
  const offset = Number(params.get("offset") ?? "0");

  try {
    const result = await getMatches({ tipos, ganadores, search, limit, offset });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error consultando BigQuery:", error);
    return NextResponse.json(
      { error: "No se pudo consultar el historial." },
      { status: 500 }
    );
  }
}
