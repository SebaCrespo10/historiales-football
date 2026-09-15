import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // permite abrir el servidor de desarrollo desde el celu/otra compu de la
  // misma red (ej. http://192.168.1.101:3001) -- si no, next bloquea los
  // recursos de dev (JS de hidratación) y los componentes interactivos
  // como el gráfico de evolución no llegan a funcionar.
  allowedDevOrigins: ["192.168.1.101"],
};

export default nextConfig;
