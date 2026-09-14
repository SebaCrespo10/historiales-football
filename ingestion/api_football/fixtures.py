"""Llamadas a /fixtures/headtohead: historial de partidos entre dos equipos."""

from .client import ApiFootballClient


def get_head_to_head(client: ApiFootballClient, team_a_id: int, team_b_id: int) -> dict:
    """Trae todos los fixtures disponibles entre dos equipos.

    En el plan free, API-Football no garantiza cobertura histórica completa
    (temporadas muy viejas pueden faltar) — el volumen real que devuelve se
    valida al correrlo, no está documentado como límite fijo.
    """
    return client.get("fixtures/headtohead", params={"h2h": f"{team_a_id}-{team_b_id}"})
