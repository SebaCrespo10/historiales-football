import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // build autocontenido (server.js + dependencias mínimas) para la imagen
  // de Docker de Cloud Run.
  output: "standalone",
  // permite abrir el servidor de desarrollo desde el celu/otra compu de la
  // misma red (ej. http://192.168.1.101:3001) -- si no, next bloquea los
  // recursos de dev (JS de hidratación) y los componentes interactivos
  // como el gráfico de evolución no llegan a funcionar.
  allowedDevOrigins: ["192.168.1.101"],
  // next/image sirve automáticamente AVIF/WebP cuando el navegador lo
  // soporta, sin tocar cómo se ven los escudos (siguen siendo los mismos
  // PNG de origen).
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
