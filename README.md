# historiales-futbol

Pipeline de datos para páginas de historial partido a partido entre rivales
de fútbol (clásicos). Arranca con el **Superclásico** (River Plate - Boca
Juniors) y está pensado para sumar otras rivalidades más adelante sin
rehacer nada (Superclásico Rosarino, Clásico Platense, etc.).

Proyecto independiente de [`football-web`](../football-web) (la web general
de resultados/ligas argentinas). En algún momento esta página de historiales
se integra a football-web, pero mientras tanto se trabaja por separado: su
propio repo, su propio proyecto de GCP, su propio dataset.

## Arquitectura

Mismo patrón en capas que football-web:

1. **Data (acá empezamos)**: ingesta desde API-Football, aterrizaje crudo en BigQuery.
2. **dbt** (después): transformar lo crudo en modelos limpios por rivalidad/partido.
3. **Web** (después): visualizar el historial partido a partido con features a definir.

## Infraestructura

- GCP project: `football-web-historiales` (separado del `dbt-training-508204` de football-web).
- BigQuery dataset: `raw_historiales`, tabla `api_responses` (landing genérico:
  `fetched_at`, `endpoint`, `params` JSON, `payload` JSON — una fila por
  respuesta cruda de la API). Mismo diseño append-only que usa football-web,
  para poder sumar cualquier endpoint/rivalidad sin tocar el esquema.
- Fuente de datos: API-Football (mismo proveedor y misma cuenta/API key que
  football-web — ver [decisión y comparación de APIs](../football-web/docs/api-football-research.md)).
  Comparte la cuota de 100 requests/día de esa cuenta.

## Rivalidades

Registradas en [`ingestion/config/rivalries.yml`](ingestion/config/rivalries.yml).
Cada una tiene los IDs de equipo de API-Football (se buscan una vez con
`fetch_team_id.py` y se guardan, para no gastar cuota de nuevo).

## Setup local

```bash
cd ingestion
python -m venv .venv
source .venv/bin/activate  # o .venv\Scripts\activate en Windows
pip install -r requirements.txt
cp .env.example .env  # completar API_FOOTBALL_KEY
```

## Uso

```bash
# 1. Buscar el ID de un equipo (una sola vez, gasta 1 request)
python fetch_team_id.py "River Plate"
python fetch_team_id.py "Boca Juniors"
# completar los IDs encontrados en config/rivalries.yml

# 2. Traer el historial head-to-head de una rivalidad y aterrizarlo crudo
python fetch_h2h.py superclasico
```
