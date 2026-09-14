"""Compila el historial completo de Superclásicos a partir del wikitext del
artículo de Wikipedia "Superclásico del fútbol argentino".

Genera un CSV local de trabajo (data/superclasico_wikipedia.csv) para
revisar y ajustar antes de pensar en cargarlo a ningún lado. Todavía no
toca BigQuery ni GCP.

Uso:
    python parse_wikipedia_superclasico.py     # parsea el wikitext ya descargado
"""

import csv
import os
import re

WIKITEXT_PATH = os.path.join(os.path.dirname(__file__), "data", "wikipedia_superclasico_raw.wikitext")
OUTPUT_CSV_PATH = os.path.join(os.path.dirname(__file__), "data", "superclasico_wikipedia.csv")

MESES = {
    "enero": 1, "febrero": 2, "marzo": 3, "abril": 4, "mayo": 5, "junio": 6,
    "julio": 7, "agosto": 8, "septiembre": 9, "octubre": 10, "noviembre": 11, "diciembre": 12,
}

# (título de sección == en el wikitext, clave de competencia, cantidad esperada según
# el propio resumen "Historial en ..." del artículo -- para validar el parseo)
SECTIONS = [
    # 218 partidos oficiales + 1 (el de 1919, anulado junto con el torneo,
    # pero listado igual en la tabla con N.º "-")
    ("=== Primera División ===", "primera_division", 219),
    ("=== Copas nacionales ===", "copas_nacionales", 16),
    ("=== Copa Libertadores de América ===", "copa_libertadores", 28),
    ("=== Otras copas internacionales ===", "otras_copas_internacionales", 4),
    ("=== Amistosos ===", "amistosos", 124),
]


def extract_table_block(text: str, section_marker: str) -> str:
    start = text.index(section_marker) + len(section_marker)
    table_start = text.index("{|", start)
    # buscar el "|}" que cierra esta tabla (no hay tablas anidadas en estas secciones)
    table_end = text.index("|}", table_start)
    return text[table_start:table_end]


def clean_cell(raw: str) -> str:
    text = raw.strip()

    # atributos de celda tipo `style="..." |contenido` / `bgcolor=... |contenido` /
    # `rowspan="2" |contenido`: todo antes del primer "|" es atributo si tiene "=".
    if "|" in text:
        left, _, right = text.partition("|")
        if "=" in left and "[[" not in left:
            text = right

    text = text.strip()

    # refs
    text = re.sub(r"<ref[^>]*/>", "", text)
    text = re.sub(r"<ref[^>]*>.*?</ref>", "", text, flags=re.S)

    # saltos de línea dentro de una celda (ej. estadio + club dueño de la cancha)
    text = re.sub(r"<br\s*/?>", "; ", text)

    # templates de formato {{nowrap|X}}, {{color|#hex|X}}, {{highlight|X|#hex}}, etc.:
    # no tienen contenido descartable (X suele ser el resultado o una nota), así
    # que cada template anidado se reemplaza por su argumento más largo (el
    # nombre del template y los códigos de color quedan afuera por ser cortos).
    def _keep_longest_arg(m: "re.Match") -> str:
        # proteger el "|" interno de wikilinks ([[target|display]]) para que no
        # se confunda con el separador de argumentos del template
        protected = re.sub(r"\[\[([^\[\]]*)\]\]", lambda lm: "[[" + lm.group(1).replace("|", "\x00") + "]]", m.group(1))
        args = [a.replace("\x00", "|") for a in protected.split("|")[1:]] or [""]
        return max(args, key=len)

    while True:
        new_text = re.sub(r"\{\{([^{}]*)\}\}", _keep_longest_arg, text)
        if new_text == text:
            break
        text = new_text

    text = re.sub(r"</?small>", "", text)

    # wikilinks [[target|display]] / [[target]]
    text = re.sub(r"\[\[([^\]|]+)\|([^\]]+)\]\]", r"\2", text)
    text = re.sub(r"\[\[([^\]]+)\]\]", r"\1", text)

    text = text.replace("'''", "").replace("''", "")
    text = text.replace("&nbsp;", " ")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalize_row_text(row_raw: str) -> str:
    """Convierte los distintos estilos de fila de MediaWiki (celdas separadas por
    `||` en una línea, o una celda por línea con `|` al inicio, o una celda
    partida por un salto de línea real) en un único string separado por `||`."""
    # una línea que empieza con "||" es continuación directa de la fila anterior
    row_raw = re.sub(r"\n(?=\|\|)", "", row_raw)
    # una línea que empieza con un solo "|" (no "||") es una celda nueva -> "||"
    # (el "|" de inicio de línea se consume: cumple el mismo rol que un "||")
    row_raw = re.sub(r"\n\|(?!\|)", "||", row_raw)
    # cualquier otro salto de línea es contenido envuelto dentro de una celda
    row_raw = row_raw.replace("\n", " ")
    return row_raw


def parse_table(table_text: str, expected_cols: int, rowspan_start_idx: int = 2) -> list[list[str]]:
    # sacamos la fila de headers (empieza con "!") y cualquier bloque de notas al pie
    # (colspan=N| ... antes del cierre) partiendo por "|-"
    raw_rows = table_text.split("|-")
    rows: list[list[str]] = []
    last_values: dict[int, str] = {}

    for raw_row in raw_rows:
        raw_row = raw_row.strip("\n")
        if not raw_row.strip():
            continue
        if raw_row.lstrip().startswith("!"):
            continue  # header
        if "colspan=" in raw_row:
            continue  # fila de leyenda/notas al pie (colspan sobre toda la tabla), no un partido

        normalized = normalize_row_text(raw_row.strip())
        normalized = normalized.strip()
        if normalized.startswith("|"):
            normalized = normalized[1:]
        cells = [clean_cell(c) for c in normalized.split("||")]

        if len(cells) < 2:
            continue

        missing = expected_cols - len(cells)
        if missing > 0:
            filled = cells[:rowspan_start_idx]
            for i in range(missing):
                filled.append(last_values.get(rowspan_start_idx + i, ""))
            filled.extend(cells[rowspan_start_idx:])
            cells = filled
        elif missing < 0:
            # más celdas de las esperadas -> algo raro, lo dejamos tal cual para inspección
            pass

        if len(cells) >= expected_cols:
            for i in range(rowspan_start_idx, expected_cols):
                last_values[i] = cells[i]

        rows.append(cells)

    return rows


def parse_date(date_raw: str) -> str:
    """Normaliza 'Fecha' a ISO (YYYY-MM-DD). Soporta '24 de agosto de 1913' y
    'DD/MM/YYYY' (este último usado en la tabla de Copa Libertadores)."""
    match = re.match(r"(\d{1,2}) de (\w+) de (\d{4})", date_raw)
    if match:
        day, mes_nombre, year = match.groups()
        mes = MESES.get(mes_nombre.lower())
        if mes:
            return f"{year}-{mes:02d}-{int(day):02d}"

    match = re.match(r"(\d{1,2})/(\d{1,2})/(\d{4})", date_raw)
    if match:
        day, month, year = match.groups()
        return f"{year}-{int(month):02d}-{int(day):02d}"

    return ""


def parse_score(resultado: str) -> tuple[str, str, str]:
    """Devuelve (home_score, away_score, nota) a partir del texto crudo de Resultado."""
    match = re.search(r"(\d+)\s*[–-]\s*(\d+)", resultado)
    if not match:
        return "", "", resultado
    home, away = match.groups()
    nota = resultado.replace(match.group(0), "").strip(" *")
    return home, away, nota


RIVER = "River Plate"
BOCA = "Boca Juniors"

# Nombre de torneo a usar para toda la sección de Copa Libertadores: en el
# wikitext esa columna trae la fase (Semifinal, Octavos, etc.), no el nombre
# del torneo, así que la pisamos acá.
TOURNAMENT_OVERRIDE = {
    "copa_libertadores": "Copa Libertadores de América",
}


def main() -> None:
    with open(WIKITEXT_PATH, encoding="utf-8") as f:
        text = f.read()

    all_rows = []
    for marker, competition_key, expected_total in SECTIONS:
        table_text = extract_table_block(text, marker)
        expected_cols = 9 if competition_key == "amistosos" else 10
        rows = parse_table(table_text, expected_cols=expected_cols)

        status = "OK" if len(rows) == expected_total else "MISMATCH"
        print(f"{competition_key}: {len(rows)} filas parseadas (esperado {expected_total}) [{status}]")

        for cells in rows:
            if competition_key == "copa_libertadores":
                num, fecha, fase, ronda, estadio, local, resultado, visitante, goles_l, goles_v = cells
            elif competition_key == "amistosos":
                num, fecha, torneo, estadio, local, resultado, visitante, goles_l, goles_v = cells
            else:
                num, fecha, torneo, ronda, estadio, local, resultado, visitante, goles_l, goles_v = cells

            torneo = TOURNAMENT_OVERRIDE.get(competition_key, torneo)
            home_score, away_score, _nota = parse_score(resultado)

            if local == RIVER:
                goles_river, goles_boca = home_score, away_score
            elif local == BOCA:
                goles_boca, goles_river = home_score, away_score
            else:
                raise ValueError(f"Local inesperado (ni River ni Boca): {local!r} en fila {cells}")

            all_rows.append({
                "Fecha": parse_date(fecha),
                "Torneo": torneo,
                "Local": local,
                "Resultado": f"{home_score}-{away_score}" if home_score and away_score else resultado,
                "Visitante": visitante,
                "Goles River": goles_river,
                "Goles Boca": goles_boca,
                "Estadio": estadio,
            })

    all_rows.sort(key=lambda r: r["Fecha"])

    os.makedirs(os.path.dirname(OUTPUT_CSV_PATH), exist_ok=True)
    with open(OUTPUT_CSV_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(all_rows[0].keys()))
        writer.writeheader()
        writer.writerows(all_rows)

    print(f"\nTotal: {len(all_rows)} partidos escritos en {OUTPUT_CSV_PATH}")


if __name__ == "__main__":
    main()
