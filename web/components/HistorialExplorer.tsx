"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { Match, Summary } from "@/lib/data";
import { SummaryHero } from "./SummaryHero";

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 350;

const TIPOS = ["Torneo Local", "Copa Local", "Copa Internacional", "Amistoso"];

type Filters = {
  fecha: string;
  torneo: string;
  fase: string;
  local: string;
  estadio: string;
  tipo: string;
  ganador: string;
};

const EMPTY_FILTERS: Filters = {
  fecha: "",
  torneo: "",
  fase: "",
  local: "",
  estadio: "",
  tipo: "",
  ganador: "",
};

type Props = {
  initialSummary: Summary;
  initialMatches: Match[];
  initialTotal: number;
};

function GanadorBadge({ ganador }: { ganador: Match["ganador"] }) {
  const styles: Record<Match["ganador"], string> = {
    River: "bg-river-red-light text-river-red border-river-red/30",
    Boca: "bg-boca-blue-light text-boca-blue border-boca-blue/30",
    Empate: "bg-gray-100 text-empate-gray border-gray-300",
  };
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${styles[ganador]}`}
    >
      {ganador === "Empate" ? "Empate" : `Ganó ${ganador}`}
    </span>
  );
}

function TipoPill({ tipo }: { tipo: string }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-celeste-light text-celeste-dark whitespace-nowrap">
      {tipo}
    </span>
  );
}

const inputClass =
  "w-full min-w-0 px-2 py-1.5 rounded-md border border-gray-300 bg-white text-xs font-normal text-negro placeholder:text-gray-400 focus:outline-none focus:border-celeste focus:ring-2 focus:ring-celeste/30";

function ColumnTextFilter({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputClass}
    />
  );
}

function ColumnSelectFilter({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
      <option value="">Todos</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function summaryCaption(tipo: string): string | undefined {
  if (!tipo) return "no incluye amistosos";
  return `solo ${tipo}`;
}

export function HistorialExplorer({ initialSummary, initialMatches, initialTotal }: Props) {
  const [summary, setSummary] = useState<Summary>(initialSummary);
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [total, setTotal] = useState(initialTotal);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [isPending, startTransition] = useTransition();
  const isFirstRun = useRef(true);

  const setFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const buildParams = useCallback((f: Filters) => {
    const params = new URLSearchParams();
    (Object.keys(f) as (keyof Filters)[]).forEach((key) => {
      if (f[key]) params.set(key, f[key]);
    });
    return params;
  }, []);

  const fetchJson = useCallback(async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("No se pudo consultar el historial.");
    return res.json();
  }, []);

  const fetchMatches = useCallback(
    (f: Filters, offset: number) => {
      const params = buildParams(f);
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(offset));
      return fetchJson(`/api/matches?${params.toString()}`);
    },
    [buildParams, fetchJson]
  );

  const fetchSummary = useCallback(
    (f: Filters) => fetchJson(`/api/summary?${buildParams(f).toString()}`),
    [buildParams, fetchJson]
  );

  // los filtros por columna afectan tanto la tabla como el resumen del encabezado
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const handle = setTimeout(() => {
      startTransition(async () => {
        try {
          const [matchesData, summaryData] = await Promise.all([
            fetchMatches(filters, 0),
            fetchSummary(filters),
          ]);
          setMatches(matchesData.matches);
          setTotal(matchesData.total);
          setSummary(summaryData);
        } catch {
          // se mantiene el estado anterior si falla la consulta
        }
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadMore = () => {
    startTransition(async () => {
      try {
        const data = await fetchMatches(filters, matches.length);
        setMatches((prev) => [...prev, ...data.matches]);
        setTotal(data.total);
      } catch {
        // se mantiene el listado ya cargado si falla la consulta
      }
    });
  };

  const hasMore = matches.length < total;
  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <>
      <SummaryHero summary={summary} caption={summaryCaption(filters.tipo)} />

      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-black text-negro">
            Partido por partido
          </h2>
          {hasActiveFilters && (
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="text-sm font-semibold text-celeste-dark hover:underline whitespace-nowrap"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="bg-negro text-white text-left">
                <th className="px-3 pt-2.5 font-semibold">Fecha</th>
                <th className="px-3 pt-2.5 font-semibold">Torneo</th>
                <th className="px-3 pt-2.5 font-semibold">Fase</th>
                <th className="px-3 pt-2.5 font-semibold">Partido</th>
                <th className="px-3 pt-2.5 font-semibold">Estadio</th>
                <th className="px-3 pt-2.5 font-semibold">Tipo</th>
                <th className="px-3 pt-2.5 font-semibold text-center w-32">Resultado</th>
              </tr>
              <tr className="bg-negro">
                <th className="px-3 pb-2.5">
                  <ColumnTextFilter
                    value={filters.fecha}
                    onChange={(v) => setFilter("fecha", v)}
                    placeholder="ej. 2024"
                  />
                </th>
                <th className="px-3 pb-2.5">
                  <ColumnTextFilter
                    value={filters.torneo}
                    onChange={(v) => setFilter("torneo", v)}
                    placeholder="Buscar..."
                  />
                </th>
                <th className="px-3 pb-2.5">
                  <ColumnTextFilter
                    value={filters.fase}
                    onChange={(v) => setFilter("fase", v)}
                    placeholder="Buscar..."
                  />
                </th>
                <th className="px-3 pb-2.5">
                  <ColumnSelectFilter
                    value={filters.local}
                    onChange={(v) => setFilter("local", v)}
                    options={[
                      { value: "River Plate", label: "River de local" },
                      { value: "Boca Juniors", label: "Boca de local" },
                    ]}
                  />
                </th>
                <th className="px-3 pb-2.5">
                  <ColumnTextFilter
                    value={filters.estadio}
                    onChange={(v) => setFilter("estadio", v)}
                    placeholder="Buscar..."
                  />
                </th>
                <th className="px-3 pb-2.5">
                  <ColumnSelectFilter
                    value={filters.tipo}
                    onChange={(v) => setFilter("tipo", v)}
                    options={TIPOS.map((t) => ({ value: t, label: t }))}
                  />
                </th>
                <th className="px-3 pb-2.5 w-32">
                  <ColumnSelectFilter
                    value={filters.ganador}
                    onChange={(v) => setFilter("ganador", v)}
                    options={[
                      { value: "River", label: "Ganó River" },
                      { value: "Boca", label: "Ganó Boca" },
                      { value: "Empate", label: "Empate" },
                    ]}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m, i) => (
                <tr
                  key={`${m.fecha}-${i}`}
                  className="border-t border-gray-100 even:bg-gray-50/60 hover:bg-celeste-light/60 transition-colors"
                >
                  <td className="px-3 py-2.5 whitespace-nowrap text-gray-600">
                    {m.fecha}
                  </td>
                  <td className="px-3 py-2.5">{m.torneo}</td>
                  <td className="px-3 py-2.5 text-gray-500">{m.fase || "—"}</td>
                  <td className="px-3 py-2.5 font-medium whitespace-nowrap">
                    {m.local} <span className="text-gray-400 mx-1">vs</span> {m.visitante}
                  </td>
                  <td className="px-3 py-2.5 text-gray-600">{m.estadio}</td>
                  <td className="px-3 py-2.5">
                    <TipoPill tipo={m.tipo} />
                  </td>
                  <td className="px-3 py-2.5 w-32">
                    <div className="flex flex-col items-center gap-1 text-center">
                      <span className="font-bold tabular-nums">{m.resultado}</span>
                      <GanadorBadge ganador={m.ganador} />
                    </div>
                  </td>
                </tr>
              ))}
              {matches.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                    No hay partidos que coincidan con estos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-gray-500">
            Mostrando {matches.length} de {total} partidos
          </p>
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={isPending}
              className="px-6 py-2.5 rounded-full bg-celeste text-white font-bold hover:bg-celeste-dark transition-colors disabled:opacity-50"
            >
              {isPending ? "Cargando..." : "Ver 10 más"}
            </button>
          )}
        </div>
      </section>
    </>
  );
}
