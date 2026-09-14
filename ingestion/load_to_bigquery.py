"""Escribe respuestas crudas de API-Football en la capa raw de BigQuery.

Una sola tabla de aterrizaje (append-only): cada fila es una respuesta
completa de la API (sobre incluido), con metadata de cuándo y con qué
parámetros se pidió. dbt lee esta tabla como source() y parsea `payload`.
"""

import os
from datetime import datetime, timezone

from google.cloud import bigquery

RAW_DATASET = os.environ.get("BQ_RAW_DATASET", "raw_historiales")
RAW_TABLE = "api_responses"


def load_response(client: bigquery.Client, endpoint: str, params: dict, payload: dict) -> None:
    """Carga vía load job (no streaming insert): el proyecto está en el
    tier gratuito de BigQuery, que no habilita la API de streaming
    inserts (insertAll)."""
    table_id = f"{client.project}.{RAW_DATASET}.{RAW_TABLE}"
    row = {
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "endpoint": endpoint,
        "params": params,
        "payload": payload,
    }
    job_config = bigquery.LoadJobConfig(
        source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
        write_disposition=bigquery.WriteDisposition.WRITE_APPEND,
    )
    job = client.load_table_from_json([row], table_id, job_config=job_config)
    job.result()
