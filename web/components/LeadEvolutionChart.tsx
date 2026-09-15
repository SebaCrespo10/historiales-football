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
const MIN_LABEL_PIXEL_GAP = 32; // ancho mínimo (px) entre el inicio de dos etiquetas de década

function colorForSign(sign: number) {
  if (sign > 0) return RIVER_RED;
  if (sign < 0) return BOCA_BLUE;
  return NEUTRAL;
}

type DecadeCandidate = { index: number; label: string };

// una candidata por década: el primer partido de cada década
function buildDecadeCandidates(fechas: string[]): DecadeCandidate[] {
  const candidates: DecadeCandidate[] = [];
  let currentDecade: number | null = null;

  fechas.forEach((fecha, i) => {
    const decade = Math.floor(parseInt(fecha.slice(0, 4), 10) / 10) * 10;
    if (decade !== currentDecade) {
      currentDecade = decade;
      candidates.push({ index: i, label: String(decade) });
    }
  });

  return candidates;
}

// filtra las candidatas que quedarían pisadas entre sí dado el ancho real del
// eje en ese momento (recalculado en cada draw, así también se adapta si la
// pantalla cambia de tamaño) -- en décadas viejas con pocos partidos, varias
// candidatas quedan muy cerca en el eje y hay que saltear algunas.
function pickVisibleDecadeLabels(
  candidates: DecadeCandidate[],
  totalPoints: number,
  axisPixelWidth: number
): Record<number, string> {
  const pixelsPerIndex = totalPoints > 1 ? axisPixelWidth / (totalPoints - 1) : axisPixelWidth;
  const minIndexGap = Math.max(1, Math.ceil(MIN_LABEL_PIXEL_GAP / pixelsPerIndex));

  const visible: Record<number, string> = {};
  let lastShownIndex = -Infinity;
  candidates.forEach(({ index, label }) => {
    if (index - lastShownIndex >= minIndexGap) {
      visible[index] = label;
      lastShownIndex = index;
    }
  });

  return visible;
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
    const decadeCandidates = buildDecadeCandidates(labels);
    const totalPoints = points.length;

    function decadeTickLabel(this: { width: number }, _value: unknown, index: number): string {
      const visible = pickVisibleDecadeLabels(decadeCandidates, totalPoints, this.width);
      return visible[index] ?? "";
    }

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
                callback: decadeTickLabel,
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
      chartRef.current.options.scales!.x!.ticks!.callback = decadeTickLabel;
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
