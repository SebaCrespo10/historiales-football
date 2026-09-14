"""Cliente HTTP para API-Football (v3.football.api-sports.io)."""

import os

import requests

BASE_URL = "https://v3.football.api-sports.io"


class ApiFootballClient:
    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.environ["API_FOOTBALL_KEY"]
        self.session = requests.Session()
        self.session.headers.update({"x-apisports-key": self.api_key})

    def get(self, path: str, params: dict | None = None) -> dict:
        response = self.session.get(f"{BASE_URL}/{path.lstrip('/')}", params=params)
        response.raise_for_status()
        return response.json()
