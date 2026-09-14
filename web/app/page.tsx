import { getMatches, getSummary } from "@/lib/data";
import { HistorialExplorer } from "@/components/HistorialExplorer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [summary, { matches, total }] = await Promise.all([
    getSummary(),
    getMatches({ limit: 10, offset: 0 }),
  ]);

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
      />

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        Historial compilado de Wikipedia · football-web-historiales
      </footer>
    </main>
  );
}
