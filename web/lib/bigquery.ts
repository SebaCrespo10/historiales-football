import { BigQuery } from "@google-cloud/bigquery";
import fs from "fs";
import path from "path";

const PROJECT_ID = process.env.GCP_PROJECT ?? "football-web-historiales";
const DATASET = process.env.BQ_RAW_DATASET ?? "raw_historiales";
const TABLE = "superclasico_partidos_wikipedia";

export const FULL_TABLE = `\`${PROJECT_ID}.${DATASET}.${TABLE}\``;

let client: BigQuery | null = null;

export function getBigQueryClient(): BigQuery {
  if (!client) {
    // en local se usa el archivo de la cuenta de servicio; si no existe (ej.
    // Cloud Run) se usan las credenciales por defecto del entorno (ADC),
    // es decir la cuenta de servicio asignada al servicio.
    const keyFilename = path.join(process.cwd(), "gcp-service-account.json");
    client = new BigQuery({
      projectId: PROJECT_ID,
      ...(fs.existsSync(keyFilename) ? { keyFilename } : {}),
    });
  }
  return client;
}
