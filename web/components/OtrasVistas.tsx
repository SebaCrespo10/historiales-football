import Link from "next/link";
import { HISTORIAL_ROUTES } from "@/lib/historial-routes";

// enlaces cruzados entre la portada y los recortes con URL propia: sin ellos
// esas páginas solo se descubren por el sitemap (Google las deja como
// "descubierta, sin indexar") y los visitantes no saben que existen.
const VISTAS = [{ path: "/", label: "Historial completo" }, ...HISTORIAL_ROUTES];

export function OtrasVistas({ currentPath }: { currentPath: string }) {
  return (
    <nav
      aria-label="Otras vistas del historial"
      className="max-w-6xl mx-auto px-4 sm:px-8 pb-10 sm:pb-14"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-negro/60 mb-3">
        Otras vistas del historial
      </h2>
      <ul className="flex flex-wrap gap-2">
        {VISTAS.map(({ path, label }) => {
          const active = path === currentPath;
          return (
            <li key={path}>
              {active ? (
                <span
                  aria-current="page"
                  className="inline-block rounded-full bg-celeste px-4 py-1.5 text-sm font-medium text-white"
                >
                  {label}
                </span>
              ) : (
                <Link
                  href={path}
                  className="inline-block rounded-full border border-celeste bg-celeste-light px-4 py-1.5 text-sm font-medium text-negro hover:bg-celeste hover:text-white transition-colors"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
