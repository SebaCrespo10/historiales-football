"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  type ChartDataset,
} from "chart.js";
import type { LeadPoint } from "@/lib/data";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

const RIVER_RED = "#e30022";
const BOCA_BLUE = "#0a3d91";
const NEUTRAL = "#9ca3af";

function colorFor(value: number | null) {
  if (!value) return NEUTRAL;
  if (value > 0) return RIVER_RED;
  return BOCA_BLUE;
}

export function LeadEvolutionChart({ points }: { points: LeadPoint[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const values = points.map((p) => p.cum);
    const labels = points.map((p) => p.fecha);

    const dataset: ChartDataset<"line", number[]> = {
      data: values,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: (ctx) => colorFor(ctx.parsed.y),
      tension: 0,
      fill: { target: { value: 0 } },
      segment: {
        borderColor: (ctx) => colorFor(((ctx.p0.parsed.y ?? 0) + (ctx.p1.parsed.y ?? 0)) / 2),
        backgroundColor: (ctx) =>
          colorFor(((ctx.p0.parsed.y ?? 0) + (ctx.p1.parsed.y ?? 0)) / 2) + "1a",
      },
    };

    if (!chartRef.current) {
      chartRef.current = new Chart(canvas, {
        type: "line",
        data: { labels, datasets: [dataset] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            tooltip: {
              callbacks: {
                title: (items) => items[0].label,
                label: (item) => {
                  const v = item.parsed.y ?? 0;
                  if (v === 0) return "Igualados";
                  return v > 0 ? `River +${v}` : `Boca +${Math.abs(v)}`;
                },
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { maxTicksLimit: 8, color: NEUTRAL, font: { size: 11 } },
            },
            y: {
              grid: {
                color: (ctx) => (ctx.tick.value === 0 ? "#c3c2b7" : "#e5e7eb"),
                lineWidth: (ctx) => (ctx.tick.value === 0 ? 1.5 : 1),
              },
              ticks: { color: NEUTRAL, font: { size: 11 } },
            },
          },
        },
      });
    } else {
      chartRef.current.data.labels = labels;
      chartRef.current.data.datasets = [dataset];
      chartRef.current.update();
    }
  }, [points]);

  useEffect(() => {
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  return (
    <div className="w-full">
      <div className="flex gap-4 items-center mb-2 text-xs text-white/90">
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-0.5 bg-river-red inline-block rounded-sm" />
          River arriba
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-0.5 bg-boca-blue inline-block rounded-sm" />
          Boca arriba
        </span>
      </div>
      <div className="relative w-full h-[220px] bg-white/95 rounded-xl p-3">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Diferencia acumulada de partidos ganados entre River y Boca a lo largo del tiempo, partido a partido"
        />
      </div>
    </div>
  );
}
