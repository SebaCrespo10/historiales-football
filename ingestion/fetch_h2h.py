"""Trae el historial head-to-head de una rivalidad y lo aterriza crudo en BigQuery.

Uso:
    python fetch_h2h.py superclasico
"""

import argparse
import os

import yaml
from dotenv import load_dotenv
from google.cloud import bigquery

load_dotenv()

from api_football.client import ApiFootballClient
from api_football.fixtures import get_head_to_head
from load_to_bigquery import load_response

RIVALRIES_PATH = os.path.join(os.path.dirname(__file__), "config", "rivalries.yml")


def load_rivalries() -> dict:
    with open(RIVALRIES_PATH, encoding="utf-8") as f:
        return yaml.safe_load(f)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("rivalry", type=str, help="Clave en config/rivalries.yml, ej. superclasico")
    args = parser.parse_args()

    rivalries = load_rivalries()
    rivalry = rivalries.get(args.rivalry)
    if rivalry is None:
        print(f"'{args.rivalry}' no está en {RIVALRIES_PATH}. Rivalidades disponibles: {list(rivalries)}")
        return

    team_a_id = rivalry["team_a"]["id"]
    team_b_id = rivalry["team_b"]["id"]
    if not team_a_id or not team_b_id:
        print(f"Faltan IDs de equipo para '{args.rivalry}' en {RIVALRIES_PATH}. Correr fetch_team_id.py primero.")
        return

    api_client = ApiFootballClient()
    bq_client = bigquery.Client(project=os.environ.get("GCP_PROJECT"))

    payload = get_head_to_head(api_client, team_a_id, team_b_id)
    if payload.get("errors"):
        print(f"Error: {payload['errors']}")
        return

    params = {"h2h": f"{team_a_id}-{team_b_id}", "rivalry": args.rivalry}
    load_response(bq_client, endpoint="fixtures_h2h", params=params, payload=payload)

    print(f"{rivalry['display_name']}: {payload.get('results')} partidos encontrados y aterrizados.")


if __name__ == "__main__":
    main()
