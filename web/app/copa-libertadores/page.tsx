import type { Metadata } from "next";
import { getHistorialRoute } from "@/lib/historial-routes";
import { HistorialRoutePage } from "@/components/HistorialRoutePage";

const PATH = "/copa-libertadores";
const ROUTE = getHistorialRoute(PATH);

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: ROUTE.title,
  description: ROUTE.description,
  alternates: { canonical: PATH },
};

export default function Page() {
  return <HistorialRoutePage path={PATH} />;
}
