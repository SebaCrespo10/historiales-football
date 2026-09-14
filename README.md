# historiales-futbol

Pipeline de datos para páginas de historial partido a partido entre rivales
de fútbol (clásicos). Arranca con el **Superclásico** (River Plate - Boca
Juniors).

Proyecto independiente de [`football-web`](../football-web) (la web general
de resultados/ligas argentinas). En algún momento esta página de historiales
se integra a football-web, pero mientras tanto se trabaja por separado: su
propio repo, su propio proyecto de GCP, su propio dataset.

## Arquitectura

1. **Data**: historial curado como CSV, cargado tal cual a BigQuery.
2. **Web (acá estamos)**: Next.js consultando BigQuery directo — ver [`web/`](web/).
3. **dbt** (después): transformar eso en modelos limpios, si hace falta antes de escalar la web.

## Infraestructura

- GCP project: `football-web-historiales` (separado del `dbt-training-508204` de football-web).
- BigQuery dataset: `raw_historiales`, tabla `superclasico_partidos_wikipedia`.
- Service account `historiales-web-reader` (solo lectura) para que la web consulte BigQuery — ver [`web/README.md`](web/README.md).

## Fuente de datos

El historial **no sale de una API**: se probó con API-Football
(`/fixtures/headtohead`) y en el plan free solo cubre partidos desde 2015,
muy lejos del historial completo del Superclásico (arranca en 1908).

En cambio, se compiló a partir de la tabla partido-por-partido del artículo
de Wikipedia
["Superclásico del fútbol argentino"](https://es.wikipedia.org/wiki/Supercl%C3%A1sico_del_f%C3%BAtbol_argentino),
validada contra los totales oficiales que el propio artículo reporta por
competencia. 391 partidos en total, 1908-2026.

## Estructura

```
ingestion/
  data/
    wikipedia_superclasico_raw.wikitext   # fuente: wikitext descargado de Wikipedia
    superclasico_wikipedia.csv            # historial curado (columnas en español, revisable a mano)
  parse_wikipedia_superclasico.py         # wikitext -> CSV
  load_superclasico_wikipedia.py          # CSV -> BigQuery (sin transformar)
```

## Setup local

```bash
cd ingestion
python -m venv .venv
source .venv/bin/activate  # o .venv\Scripts\activate en Windows
pip install -r requirements.txt
cp .env.example .env  # completar GCP_PROJECT/BQ_RAW_DATASET si difieren
```

## Uso

```bash
python parse_wikipedia_superclasico.py     # regenerar el CSV desde el wikitext
python load_superclasico_wikipedia.py      # cargar el CSV a BigQuery
```
