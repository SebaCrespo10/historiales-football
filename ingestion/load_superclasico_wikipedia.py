"""Carga el CSV curado del historial (data/superclasico_wikipedia.csv) a BigQuery,
tal cual está: sin transformar nada, solo aterrizarlo.

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

# columna del CSV (en español, con espacios, para lectura humana) -> columna de BigQuery
COLUMN_MAP = {
    "Fecha": "fecha",
    "Torneo": "torneo",
    "Fase": "fase",
    "Local": "local",
    "Resultado": "resultado",
    "Visitante": "visitante",
    "Goles River": "goles_river",
    "Goles Boca": "goles_boca",
    "Estadio": "estadio",
    "Ganador": "ganador",
    "Tipo": "tipo",
}

SCHEMA = [
    bigquery.SchemaField("fecha", "DATE", mode="REQUIRED"),
    bigquery.SchemaField("torneo", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("fase", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("local", "STRING", mode="REQUIRED"),
    bigquery.SchemaField("resultado", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("visitante", "STRING", mode="REQUIRED"),
    bigquery.SchemaField("goles_river", "INT64", mode="NULLABLE"),
    bigquery.SchemaField("goles_boca", "INT64", mode="NULLABLE"),
    bigquery.SchemaField("estadio", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("ganador", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("tipo", "STRING", mode="NULLABLE"),
]


def main() -> None:
    client = bigquery.Client(project=GCP_PROJECT)

    with open(CSV_PATH, encoding="utf-8") as f:
        raw_rows = list(csv.DictReader(f))

    rows = []
    for raw_row in raw_rows:
        row = {COLUMN_MAP[k]: v for k, v in raw_row.items()}
        row["goles_river"] = int(row["goles_river"]) if row["goles_river"] != "" else None
        row["goles_boca"] = int(row["goles_boca"]) if row["goles_boca"] != "" else None
        rows.append(row)

    table_id = f"{GCP_PROJECT}.{RAW_DATASET}.{TABLE_NAME}"
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
