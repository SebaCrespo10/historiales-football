import { HistorialExplorer } from "@/components/HistorialExplorer";
import type { LeadPoint, Match, Summary } from "@/lib/data";

type Filters = React.ComponentProps<typeof HistorialExplorer>["initialFilters"];

export function HistorialPage({
  summary,
  matches,
  total,
  faseOptions,
  leadEvolution,
  initialFilters,
}: {
  summary: Summary;
  matches: Match[];
  total: number;
  faseOptions: string[];
  leadEvolution: LeadPoint[];
  initialFilters?: Filters;
}) {
  return (
    <main className="flex-1">
      <div className="flex h-1.5 sm:h-2">
        <div className="flex-1 bg-celeste" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-celeste" />
      </div>

      <HistorialExplorer
        initialSummary={summary}
        initialMatches={matches}
        initialTotal={total}
        initialLeadEvolution={leadEvolution}
        faseOptions={faseOptions}
        initialFilters={initialFilters}
      />

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        Historial compilado de Wikipedia · football-web-historiales
      </footer>
    </main>
  );
}
