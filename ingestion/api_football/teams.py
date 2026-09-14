"""Llamadas a /teams: búsqueda de equipos por nombre para obtener su ID."""

from .client import ApiFootballClient


def search_teams(client: ApiFootballClient, name: str) -> dict:
    return client.get("teams", params={"search": name})
