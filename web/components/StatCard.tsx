type StatCardProps = {
  label: string;
  value: number;
  tone: "river" | "boca" | "empate";
};

const TONE_STYLES: Record<StatCardProps["tone"], string> = {
  river: "bg-river-red text-white",
  boca: "bg-boca-blue text-boca-yellow",
  empate: "bg-white text-negro",
};

export function StatCard({ label, value, tone }: StatCardProps) {
  return (
    <div
      className={`${TONE_STYLES[tone]} rounded-2xl shadow-lg px-4 py-5 sm:py-6 flex flex-col items-center justify-center gap-1 border-2 border-black/10`}
    >
      <span className="text-4xl sm:text-6xl font-black leading-none tabular-nums">
        {value}
      </span>
      <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide opacity-90">
        {label}
      </span>
    </div>
  );
}
