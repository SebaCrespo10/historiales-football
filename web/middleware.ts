import { NextRequest, NextResponse } from "next/server";

// evita contenido duplicado en Google: www.historialsuperclasico.com.ar
// redirige (301, permanente) al dominio sin www, manteniendo ruta y query.
const WWW_PREFIX = "www.";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (host.startsWith(WWW_PREFIX)) {
    // se arma la URL a mano (no con nextUrl.clone()): detrás del proxy de
    // Cloud Run, nextUrl hereda el host:puerto interno (8080) en vez del
    // dominio público, y la redirección terminaba apuntando a ":8080".
    const target = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      `https://${host.slice(WWW_PREFIX.length)}`
    );
    return NextResponse.redirect(target, 301);
  }
  return NextResponse.next();
}

export const config = {
  // corre en todo excepto assets estáticos de Next (no tienen host distinto que importe)
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
