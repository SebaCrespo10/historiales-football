import { ImageResponse } from "next/og";
import { getSummary } from "@/lib/data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Superclásico: historial River Plate vs Boca Juniors";

const RIVER_RED = "#e30022";
const BOCA_BLUE = "#0a3d91";
const CELESTE = "#75aadb";

export default async function OgImage() {
  const summary = await getSummary();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: CELESTE,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 6,
            color: "#ffffffcc",
            marginBottom: 8,
          }}
        >
          HISTORIAL
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 800,
            color: "#ffffff",
            marginBottom: 36,
          }}
        >
          SUPERCLÁSICO
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: RIVER_RED,
              color: "#ffffff",
              borderRadius: 20,
              padding: "24px 40px",
              width: 220,
            }}
          >
            <div style={{ display: "flex", fontSize: 64, fontWeight: 800 }}>
              {summary.river}
            </div>
            <div style={{ display: "flex", fontSize: 22, fontWeight: 700 }}>GANÓ RIVER</div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "#ffffff",
              color: "#14181f",
              borderRadius: 20,
              padding: "24px 40px",
              width: 220,
            }}
          >
            <div style={{ display: "flex", fontSize: 64, fontWeight: 800 }}>
              {summary.empates}
            </div>
            <div style={{ display: "flex", fontSize: 22, fontWeight: 700 }}>EMPATES</div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: BOCA_BLUE,
              color: "#ffd700",
              borderRadius: 20,
              padding: "24px 40px",
              width: 220,
            }}
          >
            <div style={{ display: "flex", fontSize: 64, fontWeight: 800 }}>{summary.boca}</div>
            <div style={{ display: "flex", fontSize: 22, fontWeight: 700 }}>GANÓ BOCA</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 24,
            color: "#ffffffe6",
            fontWeight: 600,
          }}
        >
          {summary.total} partidos oficiales · 1908–2026
        </div>
      </div>
    ),
    { ...size }
  );
}
