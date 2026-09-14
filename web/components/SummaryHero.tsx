import Image from "next/image";
import type { Summary } from "@/lib/data";
import { StatCard } from "./StatCard";

export function SummaryHero({ summary }: { summary: Summary }) {
  const { total, river, boca, empates } = summary;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 1000) / 10 : 0);

  return (
    <section className="bg-celeste">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-14 flex flex-col items-center gap-8">
        <div className="flex items-center justify-center gap-4 sm:gap-10 w-full">
          <Image
            src="/river-crest.png"
            alt="Escudo de River Plate"
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
              River Plate — Boca Juniors
            </p>
          </div>
          <Image
            src="/boca-crest.png"
            alt="Escudo de Boca Juniors"
            width={96}
            height={112}
            className="w-16 sm:w-24 h-auto drop-shadow-lg"
            priority
          />
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-2xl">
          <StatCard label="Ganó River" value={river} tone="river" />
          <StatCard label="Empates" value={empates} tone="empate" />
          <StatCard label="Ganó Boca" value={boca} tone="boca" />
        </div>

        <div className="w-full max-w-2xl">
          <div className="flex h-3 sm:h-4 rounded-full overflow-hidden border border-black/10">
            <div className="bg-river-red" style={{ width: `${pct(river)}%` }} />
            <div className="bg-white" style={{ width: `${pct(empates)}%` }} />
            <div className="bg-boca-blue" style={{ width: `${pct(boca)}%` }} />
          </div>
          <div className="flex justify-between text-[11px] sm:text-xs text-white/90 mt-1.5 font-medium">
            <span>{pct(river)}%</span>
            <span>{pct(empates)}%</span>
            <span>{pct(boca)}%</span>
          </div>
        </div>

        <p className="text-white/95 text-sm sm:text-base font-semibold text-center">
          {total} partidos oficiales disputados{" "}
          <span className="font-normal opacity-80">(no incluye amistosos)</span>
        </p>
      </div>
    </section>
  );
}
