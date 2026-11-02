import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { getTotalPartidosLabel } from "@/lib/historial";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// solo se carga con el ID seteado (producción); en local no se mide.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// la cantidad de partidos sale de BigQuery (consulta cacheada), así no hay que
// editar el texto a mano cada vez que se carga un Superclásico nuevo.
export async function generateMetadata(): Promise<Metadata> {
  const partidos = await getTotalPartidosLabel();
  const description = `Historial completo del Superclásico entre River Plate y Boca Juniors: ${partidos} desde 1908, filtrable por torneo, fase, estadio y resultado.`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Superclásico | Historial River - Boca",
      template: `%s | ${SITE_NAME}`,
    },
    description,
    openGraph: {
      type: "website",
      locale: "es_AR",
      siteName: SITE_NAME,
      title: "Superclásico | Historial River - Boca",
      description,
      url: SITE_URL,
    },
    twitter: {
      card: "summary_large_image",
      title: "Superclásico | Historial River - Boca",
      description,
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-negro">
        {children}
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  );
}
