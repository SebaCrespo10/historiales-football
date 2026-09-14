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

export type MatchFilters = {
  fecha?: string;
  torneo?: string;
  fase?: string;
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
  const types: Record<string, string> = {};

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

  like("fecha", "fecha", filters.fecha);
  like("torneo", "torneo", filters.torneo);
  like("fase", "fase", filters.fase);
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
