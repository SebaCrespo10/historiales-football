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
const AXIS_COLOR = NEUTRAL;
const GRID_COLOR = "#e5e7eb";
const MIN_LABEL_GAP = 14;

function colorForSign(sign: number) {
  if (sign > 0) return RIVER_RED;
  if (sign < 0) return BOCA_BLUE;
  return NEUTRAL;
}

// etiquetas de década en el eje X, salteando cualquiera que quede a menos de
// MIN_LABEL_GAP partidos de la anterior mostrada (si no, se superponen en las
// décadas viejas, donde hay pocos partidos por año)
function buildDecadeLabels(fechas: string[]): Record<number, string> {
  const labelAt: Record<number, string> = {};
  let currentDecade: number | null = null;
  let lastShownIndex = -Infinity;

  fechas.forEach((fecha, i) => {
    const decade = Math.floor(parseInt(fecha.slice(0, 4), 10) / 10) * 10;
    if (decade !== currentDecade) {
      currentDecade = decade;
      if (i - lastShownIndex >= MIN_LABEL_GAP) {
        labelAt[i] = String(decade);
        lastShownIndex = i;
      }
    }
  });

  return labelAt;
}

export function LeadEvolutionChart({ points }: { points: LeadPoint[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const labels = points.map((p) => p.fecha);
    const values = points.map((p) => Math.abs(p.cum));
    const signs = points.map((p) => Math.sign(p.cum));
    const decadeLabelAt = buildDecadeLabels(labels);

    const dataset: ChartDataset<"line", number[]> = {
      data: values,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: (ctx) => colorForSign(signs[ctx.dataIndex]),
      cubicInterpolationMode: "monotone",
      fill: "origin",
      segment: {
        borderColor: (ctx) => colorForSign(signs[ctx.p1DataIndex]),
        backgroundColor: (ctx) => colorForSign(signs[ctx.p1DataIndex]) + "1a",
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
                  const v = item.parsed.y;
                  const s = signs[item.dataIndex];
                  if (v === 0) return "Igualados";
                  return s > 0 ? `River +${v}` : `Boca +${v}`;
                },
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                autoSkip: false,
                maxRotation: 0,
                color: AXIS_COLOR,
                font: { size: 10 },
                callback: (_value, index) => decadeLabelAt[index] ?? "",
              },
            },
            y: {
              beginAtZero: true,
              grid: { color: GRID_COLOR },
              ticks: { color: AXIS_COLOR, font: { size: 10 } },
            },
          },
        },
      });
    } else {
      chartRef.current.data.labels = labels;
      chartRef.current.data.datasets = [dataset];
      chartRef.current.options.scales!.x!.ticks!.callback = (_value, index) =>
        decadeLabelAt[index] ?? "";
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
    <div className="relative w-full h-[120px] bg-celeste-light rounded-xl p-3">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Evolución de quién va arriba en el historial: la línea sube o baja según cuántos partidos de ventaja tiene el que va ganando en ese momento, en rojo si es River y en azul si es Boca"
      />
    </div>
  );
}
