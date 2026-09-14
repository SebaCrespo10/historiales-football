# web

Web del historial del Superclásico (River Plate - Boca Juniors), armada en
Next.js. Consulta directo `raw_historiales.superclasico_partidos_wikipedia`
en BigQuery — sin capa de dbt todavía, ni caché intermedia.

## Qué muestra

- Historial general (oficiales, sin amistosos): partidos ganados por cada
  lado, empates y porcentajes, en grande.
- Tabla partido por partido, empezando por los últimos 10, con botón
  "Ver 10 más" para ir cargando el resto (391 partidos en total).
- Filtros por Tipo (Torneo Local / Copa Local / Copa Internacional /
  Amistoso), por Ganador (River / Boca / Empate) y búsqueda libre por
  torneo o estadio.

## Conexión a BigQuery

Usa una service account de solo lectura (`historiales-web-reader`, roles
`bigquery.dataViewer` + `bigquery.jobUser`) creada en el proyecto
`football-web-historiales`. La key vive en `gcp-service-account.json`
**(no versionada — está en `.gitignore`)**.

Si cloná el repo de cero, para correr esto localmente necesitás:

1. Pedir `gcp-service-account.json` (o generar una key nueva para esa
   service account) y ponerlo en la raíz de `web/`.
2. `.env.local` con:
   ```
   GCP_PROJECT=football-web-historiales
   BQ_RAW_DATASET=raw_historiales
   ```

## Desarrollo

```bash
npm install
npm run dev
```

## Estructura

```
app/
  page.tsx                 # Server Component: trae summary + primeros 10 partidos
  api/matches/route.ts      # GET paginado/filtrado, usado por "Ver más" y los filtros
lib/
  bigquery.ts               # cliente de BigQuery (service account)
  data.ts                   # queries: getSummary, getMatches, getFilterOptions
components/
  SummaryHero.tsx            # historial general en grande
  HistorialExplorer.tsx      # filtros + tabla + paginación (client component)
  StatCard.tsx
public/
  river-crest.png, boca-crest.png   # escudos oficiales (Wikimedia Commons)
```
