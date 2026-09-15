# Tareas pendientes

Salen del plan de SEO/distribución (artifact "SEO Superclásico",
https://claude.ai/artifact/UYqKQ57uyWqH7ki6A39SS4). Ya se implementó todo lo
del Grupo A que no necesitaba nada del usuario (ver commit `67ae559`:
metadata, sitemap, robots.txt, JSON-LD, imagen OG dinámica, 6 rutas por
recorte). Lo que queda:

## Grupo A — pendiente, necesita algo del usuario

- [ ] **Dominio propio + HTTPS + deploy en producción.** Prerrequisito de
      todo lo demás (Search Console, indexación real, compartir links).
- [ ] **Alta en Google Search Console y Bing Webmaster Tools.** Necesita
      login con la cuenta de Google/Microsoft del usuario. Depende de tener
      el dominio ya publicado.
- [ ] **Analytics.** Falta decidir la herramienta (Google Analytics, Vercel
      Analytics, Plausible, etc.) y conseguir el ID/tracking code para
      integrarlo.
- [ ] **Calendario de contenido para redes** atado a fechas reales de
      Superclásico y aniversarios (ej. el partido de 1913). Tarea de
      operación/contenido, no de código.
- [ ] **Siembra en foros y comunidades de hinchas** (Reddit de ambos clubes,
      grupos de Twitter/X) una vez que el sitio esté publicado — no antes,
      un link a `localhost` no sirve.

## Grupo B — pendiente, implica agregar algo visual nuevo (todavía sin aprobar)

- [ ] **Página de ficha por partido** (`/partido/<fecha>` o similar). Hoy no
      existe una vista de un partido individual — habría que diseñarla,
      aunque reutilizando colores/componentes ya existentes. Son ~391 URLs
      indexables generadas por plantilla a partir de los datos que ya están.
- [ ] **Módulo "un día como hoy"** en la portada: busca si hubo un
      Superclásico en la fecha actual en años anteriores y lo muestra. Nueva
      sección visible en el home.
- [ ] **Sección de FAQ** (preguntas frecuentes cortas y factuales, tipo
      "¿Quién ganó más Superclásicos?"). Nueva sección visible. Una vez que
      exista, sumarle también el JSON-LD `FAQPage` correspondiente (se dejó
      afuera a propósito en la implementación de JSON-LD porque ese schema
      no debe usarse sin contenido visible que lo respalde).
