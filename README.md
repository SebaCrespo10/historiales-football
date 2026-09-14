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

1. **Data (acá estamos, todavía en local)**: compilar y revisar el historial como CSV.
2. **GCP**: recién cuando el CSV esté conforme, se carga a BigQuery.
3. **dbt**: transformar eso en modelos limpios por rivalidad/partido.
4. **Web**: visualizar el historial partido a partido con features a definir.

## Infraestructura

- GCP project: `football-web-historiales` (separado del `dbt-training-508204` de football-web). Por ahora solo tiene el dataset `raw_historiales` con la prueba de API-Football (ver abajo) — el historial curado todavía no se cargó.

## Fuentes de datos

El historial partido a partido **no sale de API-Football**: se probó con el
endpoint `/fixtures/headtohead` y en el plan free solo cubre desde 2015 (26
de ~390 partidos), muy lejos del historial completo del Superclásico
(arranca en 1913). En cambio:

- **Historial completo (curado)**: compilado a partir de la tabla
  partido-por-partido del artículo de Wikipedia
  ["Superclásico del fútbol argentino"](https://es.wikipedia.org/wiki/Supercl%C3%A1sico_del_f%C3%BAtbol_argentino).
  Proceso reproducible en [`ingestion/parse_wikipedia_superclasico.py`](ingestion/parse_wikipedia_superclasico.py):
  parsea el wikitext (`ingestion/data/wikipedia_superclasico_raw.wikitext`) a
  un CSV curado (`ingestion/data/superclasico_wikipedia.csv`), validado contra
  los totales oficiales que el propio artículo reporta por competencia
  (Primera División, copas nacionales, Copa Libertadores, otras copas
  internacionales, amistosos). 391 partidos en total, 1908-2026.
  **Por ahora este CSV es solo local** — se está revisando/ajustando antes
  de pensar en cargarlo a BigQuery.
- **API-Football** (mismo proveedor/cuenta que football-web — ver
  [decisión y comparación de APIs](../football-web/docs/api-football-research.md)):
  queda solo como fuente complementaria para resultados recientes/en vivo
  (`fetch_h2h.py` ya aterriza esto en `raw_historiales.api_responses`,
  endpoint `fixtures_h2h`), no como fuente del historial.

## Rivalidades

Registradas en [`ingestion/config/rivalries.yml`](ingestion/config/rivalries.yml).
Cada una tiene los IDs de equipo de API-Football (se buscan una vez con
`fetch_team_id.py` y se guardan, para no gastar cuota de nuevo) — usados solo
para la fuente complementaria de API-Football, no para el historial curado.

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
# Historial completo (curado de Wikipedia) -> CSV local, para revisar
python parse_wikipedia_superclasico.py

# Complementario: resultados recientes vía API-Football (opcional)
python fetch_team_id.py "River Plate"
python fetch_team_id.py "Boca Juniors"
# completar los IDs encontrados en config/rivalries.yml
python fetch_h2h.py superclasico
```
