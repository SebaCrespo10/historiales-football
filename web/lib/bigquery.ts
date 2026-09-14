import { BigQuery } from "@google-cloud/bigquery";
import path from "path";

const PROJECT_ID = process.env.GCP_PROJECT ?? "football-web-historiales";
const DATASET = process.env.BQ_RAW_DATASET ?? "raw_historiales";
const TABLE = "superclasico_partidos_wikipedia";

export const FULL_TABLE = `\`${PROJECT_ID}.${DATASET}.${TABLE}\``;

let client: BigQuery | null = null;

export function getBigQueryClient(): BigQuery {
  if (!client) {
    client = new BigQuery({
      projectId: PROJECT_ID,
      keyFilename: path.join(process.cwd(), "gcp-service-account.json"),
    });
  }
  return client;
}
