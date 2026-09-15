import { BigQuery } from "@google-cloud/bigquery";
import { getBigQueryClient, FULL_TABLE } from "./bigquery";

export type Match = {
  fecha: string;
  torneo: string;
  fase: string;
  local: string;
  resultado: string;
  visitante: string;
  goles_river: number;
  goles_boca: number;
  estadio: string;
  ganador: "River" | "Boca" | "Empate";
  tipo: "Torneo Local" | "Copa Local" | "Copa Internacional" | "Amistoso";
};

export type Summary = {
  total: number;
  river: number;
  boca: number;
  empates: number;
  golesRiver: number;
  golesBoca: number;
};

export type LeadPoint = {
  fecha: string;
  cum: number;
};

export type MatchFilters = {
  fechaDesde?: string;
  fechaHasta?: string;
  torneo?: string;
  fases?: string[];
  local?: string;
  estadio?: string;
  tipo?: string;
  ganador?: string;
  limit?: number;
  offset?: number;
};

// BigQuery devuelve BigInt/objetos especiales para INT64/DATE -> los normalizamos a tipos planos de JS
function normalizeRow(row: Record<string, unknown>): Match {
  return {
    fecha: (row.fecha as { value: string }).value,
    torneo: row.torneo as string,
    fase: (row.fase as string) ?? "",
    local: row.local as string,
    resultado: row.resultado as string,
    visitante: row.visitante as string,
    goles_river: Number(row.goles_river),
    goles_boca: Number(row.goles_boca),
    estadio: row.estadio as string,
    ganador: row.ganador as Match["ganador"],
    tipo: row.tipo as Match["tipo"],
  };
}

function buildWhere(
  filters: MatchFilters,
  opts: { excludeAmistosoByDefault?: boolean } = {}
) {
  const clauses: string[] = [];
  const params: Record<string, unknown> = {};
  const types: Record<string, string | string[]> = {};

  const like = (column: string, key: string, value?: string) => {
    if (value && value.trim() !== "") {
      clauses.push(`LOWER(${column}) LIKE @${key}`);
      params[key] = `%${value.trim().toLowerCase()}%`;
      types[key] = "STRING";
    }
  };
  const equals = (column: string, key: string, value?: string) => {
    if (value && value.trim() !== "") {
      clauses.push(`${column} = @${key}`);
      params[key] = value;
      types[key] = "STRING";
    }
  };

  if (filters.fechaDesde) {
    clauses.push("fecha >= @fechaDesde");
    // el cliente de Node necesita el valor envuelto con BigQuery.date(): pasar
    // un string plano con types:{...:"DATE"} lo manda mal y la condición no matchea nada.
    params.fechaDesde = BigQuery.date(filters.fechaDesde);
  }
  if (filters.fechaHasta) {
    clauses.push("fecha <= @fechaHasta");
    params.fechaHasta = BigQuery.date(filters.fechaHasta);
  }
  like("torneo", "torneo", filters.torneo);
  if (filters.fases && filters.fases.length > 0) {
    clauses.push("fase IN UNNEST(@fases)");
    params.fases = filters.fases;
    types.fases = ["STRING"];
  }
  like("estadio", "estadio", filters.estadio);
  equals("local", "local", filters.local);
  equals("ganador", "ganador", filters.ganador);

  if (filters.tipo && filters.tipo.trim() !== "") {
    equals("tipo", "tipo", filters.tipo);
  } else if (opts.excludeAmistosoByDefault) {
    // sin un filtro de tipo explícito, el "historial general" no cuenta amistosos
    clauses.push("tipo != 'Amistoso'");
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, params, types };
}

export async function getMatches(
  filters: MatchFilters = {}
): Promise<{ matches: Match[]; total: number }> {
  const bigquery = getBigQueryClient();
  const limit = filters.limit ?? 10;
  const offset = filters.offset ?? 0;
  const { where, params, types } = buildWhere(filters);

  const [rows] = await bigquery.query({
    query: `
      SELECT fecha, torneo, fase, local, resultado, visitante, goles_river, goles_boca, estadio, ganador, tipo
      FROM ${FULL_TABLE}
      ${where}
      ORDER BY fecha DESC
      LIMIT @limit OFFSET @offset
    `,
    params: { ...params, limit, offset },
    types: { ...types, limit: "INT64", offset: "INT64" },
  });

  const [countRows] = await bigquery.query({
    query: `SELECT COUNT(*) AS total FROM ${FULL_TABLE} ${where}`,
    params,
    types,
  });

  return {
    matches: rows.map(normalizeRow),
    total: Number(countRows[0].total),
  };
}

export async function getSummary(filters: MatchFilters = {}): Promise<Summary> {
  const bigquery = getBigQueryClient();
  const { where, params, types } = buildWhere(filters, {
    excludeAmistosoByDefault: true,
  });

  const [rows] = await bigquery.query({
    query: `
      SELECT
        COUNT(*) AS total,
        COUNTIF(ganador = 'River') AS river,
        COUNTIF(ganador = 'Boca') AS boca,
        COUNTIF(ganador = 'Empate') AS empates,
        SUM(goles_river) AS golesRiver,
        SUM(goles_boca) AS golesBoca
      FROM ${FULL_TABLE}
      ${where}
    `,
    params,
    types,
  });

  const row = rows[0];
  return {
    total: Number(row.total),
    river: Number(row.river),
    boca: Number(row.boca),
    empates: Number(row.empates),
    golesRiver: Number(row.golesRiver),
    golesBoca: Number(row.golesBoca),
  };
}

export async function getLeadEvolution(filters: MatchFilters = {}): Promise<LeadPoint[]> {
  const bigquery = getBigQueryClient();
  const { where, params, types } = buildWhere(filters, {
    excludeAmistosoByDefault: true,
  });

  const [rows] = await bigquery.query({
    query: `
      SELECT fecha, ganador
      FROM ${FULL_TABLE}
      ${where}
      ORDER BY fecha ASC
    `,
    params,
    types,
  });

  let cum = 0;
  return rows.map((row: { fecha: { value: string }; ganador: string }) => {
    if (row.ganador === "River") cum += 1;
    else if (row.ganador === "Boca") cum -= 1;
    return { fecha: row.fecha.value, cum };
  });
}

export async function getFaseOptions(): Promise<string[]> {
  const bigquery = getBigQueryClient();
  const [rows] = await bigquery.query({
    query: `SELECT DISTINCT fase FROM ${FULL_TABLE} WHERE fase != '' ORDER BY fase`,
  });

  const fases = rows.map((r: { fase: string }) => r.fase);

  // las "fechas" de campeonato (fase = número de jornada) van primero y en
  // orden numérico; el resto de las fases (nombres) van después, alfabético
  return fases.sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);
    const aIsNum = a !== "" && !Number.isNaN(na);
    const bIsNum = b !== "" && !Number.isNaN(nb);
    if (aIsNum && bIsNum) return na - nb;
    if (aIsNum) return -1;
    if (bIsNum) return 1;
    return a.localeCompare(b, "es");
  });
}
