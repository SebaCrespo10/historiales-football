import Image from "next/image";
import type { LeadPoint, Summary } from "@/lib/data";
import { StatCard } from "./StatCard";
import { LeadEvolutionChart } from "./LeadEvolutionChart";

const CRESTS = {
  river: { src: "/river-crest.png", alt: "Escudo de River Plate" },
  boca: { src: "/boca-crest-v2.png", alt: "Escudo de Boca Juniors" },
};

export function SummaryHero({
  summary,
  caption,
  leadEvolution,
}: {
  summary: Summary;
  caption?: string;
  leadEvolution: LeadPoint[];
}) {
  const { total, river, boca, empates } = summary;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 1000) / 10 : 0);

  // el equipo con más partidos ganados (bajo los filtros activos) va a la izquierda;
  // en caso de empate, River queda primero por defecto.
  const leader: "river" | "boca" = boca > river ? "boca" : "river";
  const trailer: "river" | "boca" = leader === "river" ? "boca" : "river";

  const stats = {
    river: { label: "Ganó River", value: river, tone: "river" as const },
    boca: { label: "Ganó Boca", value: boca, tone: "boca" as const },
  };

  return (
    <section className="bg-celeste">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-14 flex flex-col items-center gap-8">
        <div className="flex items-center justify-center gap-4 sm:gap-10 w-full">
          <Image
            src={CRESTS[leader].src}
            alt={CRESTS[leader].alt}
            width={96}
            height={112}
            className="w-16 sm:w-24 h-auto drop-shadow-lg"
            priority
          />
          <div className="text-center text-white">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase opacity-90">
              Historial
            </p>
            <h1 className="text-3xl sm:text-6xl font-black tracking-tight drop-shadow-sm">
              SUPERCLÁSICO
            </h1>
            <p className="text-sm sm:text-lg font-medium opacity-95">
              {leader === "river" ? "River Plate — Boca Juniors" : "Boca Juniors — River Plate"}
            </p>
          </div>
          <Image
            src={CRESTS[trailer].src}
            alt={CRESTS[trailer].alt}
            width={96}
            height={112}
            className="w-16 sm:w-24 h-auto drop-shadow-lg"
            priority
          />
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-2xl">
          <StatCard {...stats[leader]} />
          <StatCard label="Empates" value={empates} tone="empate" />
          <StatCard {...stats[trailer]} />
        </div>

        <div className="w-full max-w-2xl">
          <div className="flex h-3 sm:h-4 rounded-full overflow-hidden border border-black/10">
            <div
              className={leader === "river" ? "bg-river-red" : "bg-boca-blue"}
              style={{ width: `${pct(stats[leader].value)}%` }}
            />
            <div className="bg-white" style={{ width: `${pct(empates)}%` }} />
            <div
              className={trailer === "river" ? "bg-river-red" : "bg-boca-blue"}
              style={{ width: `${pct(stats[trailer].value)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] sm:text-xs text-white/90 mt-1.5 font-medium">
            <span>{pct(stats[leader].value)}%</span>
            <span>{pct(empates)}%</span>
            <span>{pct(stats[trailer].value)}%</span>
          </div>
        </div>

        <p className="text-white/95 text-sm sm:text-base font-semibold text-center">
          {total} partidos disputados
          {caption && <span className="font-normal opacity-80"> ({caption})</span>}
        </p>

        {leadEvolution.length > 1 && (
          <div className="w-full">
            <LeadEvolutionChart points={leadEvolution} />
          </div>
        )}
      </div>
    </section>
  );
}
