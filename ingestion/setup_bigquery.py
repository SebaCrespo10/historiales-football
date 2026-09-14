"""Crea (si no existen) el dataset y la tabla raw en BigQuery.

Idempotente: correrlo de nuevo no pisa nada si el dataset/tabla ya existen.
Uso: python setup_bigquery.py
"""

import os

from google.cloud import bigquery

GCP_PROJECT = os.environ.get("GCP_PROJECT", "football-web-historiales")
RAW_DATASET = os.environ.get("BQ_RAW_DATASET", "raw_historiales")
LOCATION = "US"

RAW_TABLE_SCHEMA = [
    bigquery.SchemaField("fetched_at", "TIMESTAMP", mode="REQUIRED"),
    bigquery.SchemaField("endpoint", "STRING", mode="REQUIRED"),
    bigquery.SchemaField("params", "JSON", mode="NULLABLE"),
    bigquery.SchemaField("payload", "JSON", mode="REQUIRED"),
]


def main() -> None:
    client = bigquery.Client(project=GCP_PROJECT)

    dataset_id = f"{GCP_PROJECT}.{RAW_DATASET}"
    dataset = bigquery.Dataset(dataset_id)
    dataset.location = LOCATION
    dataset = client.create_dataset(dataset, exists_ok=True)
    print(f"Dataset listo: {dataset_id}")

    table_id = f"{dataset_id}.api_responses"
    table = bigquery.Table(table_id, schema=RAW_TABLE_SCHEMA)
    table = client.create_table(table, exists_ok=True)
    print(f"Tabla lista: {table_id}")


if __name__ == "__main__":
    main()
