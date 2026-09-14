"use client";

import { useCallback, useState, useTransition } from "react";
import type { Match } from "@/lib/data";

const PAGE_SIZE = 10;

const TIPOS = ["Torneo Local", "Copa Local", "Copa Internacional", "Amistoso"];
const GANADORES: { value: string; label: string }[] = [
  { value: "River", label: "Ganó River" },
  { value: "Boca", label: "Ganó Boca" },
  { value: "Empate", label: "Empate" },
];

type Props = {
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
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${styles[ganador]}`}
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

function ToggleGroup({
  options,
  selected,
  onToggle,
  onClear,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
}) {
  const isAll = selected.length === 0;
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={onClear}
        className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
          isAll
            ? "bg-negro text-white border-negro"
            : "bg-white text-negro border-gray-300 hover:border-negro"
        }`}
      >
        Todas
      </button>
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => onToggle(opt.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
              active
                ? "bg-celeste text-white border-celeste"
                : "bg-white text-negro border-gray-300 hover:border-celeste"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function HistorialExplorer({ initialMatches, initialTotal }: Props) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [total, setTotal] = useState(initialTotal);
  const [tipos, setTipos] = useState<string[]>([]);
  const [ganadores, setGanadores] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const fetchMatches = useCallback(
    (nextTipos: string[], nextGanadores: string[], nextSearch: string, offset: number) => {
      const params = new URLSearchParams();
      nextTipos.forEach((t) => params.append("tipo", t));
      nextGanadores.forEach((g) => params.append("ganador", g));
      if (nextSearch.trim()) params.set("q", nextSearch.trim());
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(offset));

      return fetch(`/api/matches?${params.toString()}`).then(async (res) => {
        if (!res.ok) throw new Error("No se pudo cargar el historial.");
        return res.json();
      });
    },
    []
  );

  const applyFilters = useCallback(
    (nextTipos: string[], nextGanadores: string[], nextSearch: string) => {
      startTransition(async () => {
        try {
          const data = await fetchMatches(nextTipos, nextGanadores, nextSearch, 0);
          setMatches(data.matches);
          setTotal(data.total);
        } catch {
          // se mantiene el listado anterior si falla la consulta
        }
      });
    },
    [fetchMatches]
  );

  const toggleTipo = (value: string) => {
    const next = tipos.includes(value) ? tipos.filter((t) => t !== value) : [...tipos, value];
    setTipos(next);
    applyFilters(next, ganadores, search);
  };

  const toggleGanador = (value: string) => {
    const next = ganadores.includes(value)
      ? ganadores.filter((g) => g !== value)
      : [...ganadores, value];
    setGanadores(next);
    applyFilters(tipos, next, search);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    applyFilters(tipos, ganadores, value);
  };

  const loadMore = () => {
    startTransition(async () => {
      try {
        const data = await fetchMatches(tipos, ganadores, search, matches.length);
        setMatches((prev) => [...prev, ...data.matches]);
        setTotal(data.total);
      } catch {
        // se mantiene el listado ya cargado si falla la consulta
      }
    });
  };

  const hasMore = matches.length < total;

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-14 flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl sm:text-2xl font-black text-negro">
          Partido por partido
        </h2>

        <div className="flex flex-col gap-3">
          <ToggleGroup
            options={TIPOS.map((t) => ({ value: t, label: t }))}
            selected={tipos}
            onToggle={toggleTipo}
            onClear={() => {
              setTipos([]);
              applyFilters([], ganadores, search);
            }}
          />
          <ToggleGroup
            options={GANADORES}
            selected={ganadores}
            onToggle={toggleGanador}
            onClear={() => {
              setGanadores([]);
              applyFilters(tipos, [], search);
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por torneo o estadio..."
            className="w-full sm:max-w-sm px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-celeste focus:ring-2 focus:ring-celeste/30"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="bg-negro text-white text-left">
              <th className="px-3 py-2.5 font-semibold">Fecha</th>
              <th className="px-3 py-2.5 font-semibold">Torneo</th>
              <th className="px-3 py-2.5 font-semibold">Fase</th>
              <th className="px-3 py-2.5 font-semibold">Partido</th>
              <th className="px-3 py-2.5 font-semibold">Estadio</th>
              <th className="px-3 py-2.5 font-semibold">Tipo</th>
              <th className="px-3 py-2.5 font-semibold">Resultado</th>
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
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
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
  );
}
