"""Busca el ID de un equipo en API-Football por nombre.

No aterriza nada en BigQuery: es una consulta manual para completar
config/rivalries.yml. Gasta 1 request de cuota por corrida.

Uso:
    python fetch_team_id.py "River Plate"
"""

import argparse
import json

from dotenv import load_dotenv

load_dotenv()

from api_football.client import ApiFootballClient
from api_football.teams import search_teams


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("name", type=str, help="Nombre del equipo a buscar")
    args = parser.parse_args()

    client = ApiFootballClient()
    payload = search_teams(client, args.name)

    if payload.get("errors"):
        print(f"Error: {payload['errors']}")
        return

    for item in payload.get("response", []):
        team = item["team"]
        venue = item.get("venue", {})
        print(f"id={team['id']}  name={team['name']}  country={team['country']}  founded={team.get('founded')}  venue={venue.get('name')}")

    if not payload.get("response"):
        print("Sin resultados.")
        print(json.dumps(payload, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
