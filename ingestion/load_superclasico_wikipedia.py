"""Carga el CSV curado (compilado de Wikipedia) a BigQuery.

A diferencia de load_to_bigquery.py (que aterriza payloads crudos de la API
en una tabla genérica), esto es un dataset ya curado/estructurado, así que
va a su propia tabla con columnas explícitas en vez del landing genérico
`api_responses`.

Uso:
    python load_superclasico_wikipedia.py
"""

import csv
import os

from dotenv import load_dotenv
from google.cloud import bigquery

load_dotenv()

CSV_PATH = os.path.join(os.path.dirname(__file__), "data", "superclasico_wikipedia.csv")
GCP_PROJECT = os.environ.get("GCP_PROJECT", "football-web-historiales")
RAW_DATASET = os.environ.get("BQ_RAW_DATASET", "raw_historiales")
TABLE_NAME = "superclasico_partidos_wikipedia"

SCHEMA = [
    bigquery.SchemaField("competition_section", "STRING", mode="REQUIRED"),
    bigquery.SchemaField("match_number", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("match_date", "DATE", mode="NULLABLE"),
    bigquery.SchemaField("date_raw", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("tournament", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("round", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("stadium", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("home_team", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("away_team", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("home_score", "INT64", mode="NULLABLE"),
    bigquery.SchemaField("away_score", "INT64", mode="NULLABLE"),
    bigquery.SchemaField("score_note", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("home_scorers", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("away_scorers", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("source", "STRING", mode="REQUIRED"),
]


def main() -> None:
    client = bigquery.Client(project=GCP_PROJECT)

    dataset_id = f"{GCP_PROJECT}.{RAW_DATASET}"
    dataset = bigquery.Dataset(dataset_id)
    dataset.location = "US"
    client.create_dataset(dataset, exists_ok=True)

    with open(CSV_PATH, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    for row in rows:
        row["home_score"] = int(row["home_score"]) if row["home_score"] else None
        row["away_score"] = int(row["away_score"]) if row["away_score"] else None
        row["match_date"] = row["match_date"] or None
        row["source"] = "wikipedia:Superclásico del fútbol argentino"

    table_id = f"{dataset_id}.{TABLE_NAME}"
    job_config = bigquery.LoadJobConfig(
        schema=SCHEMA,
        source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
        write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE,
    )
    job = client.load_table_from_json(rows, table_id, job_config=job_config)
    job.result()

    print(f"{len(rows)} partidos cargados en {table_id}")


if __name__ == "__main__":
    main()
