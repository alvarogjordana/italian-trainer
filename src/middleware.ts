// ---------------------------------------------------------------------------
// Gatekeeper for the whole app: HTTP Basic Auth checked at the edge.
//
// This is a "keep strangers off the public URL" gate, not real per-user
// auth — there is one shared username/password, no accounts, no database.
// Credentials are read from environment variables so they never ship in the
// client JS bundle. Set APP_BASIC_AUTH_USER / APP_BASIC_AUTH_PASSWORD in
// .env.local for dev and in the Vercel project settings for production.
// ---------------------------------------------------------------------------

import { NextResponse, type NextRequest } from "next/server";

const REALM = "Impara l'italiano";

function unauthorized(): NextResponse {
  return new NextResponse("Autenticazione richiesta.", {
    status: 401,
    headers: { "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"` },
  });
}

export function middleware(req: NextRequest): NextResponse {
  const expectedUser = process.env.APP_BASIC_AUTH_USER;
  const expectedPass = process.env.APP_BASIC_AUTH_PASSWORD;

  // If credentials aren't configured, don't lock everyone out silently.
  if (!expectedUser || !expectedPass) return NextResponse.next();

  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Basic ")) return unauthorized();

  let user = "";
  let pass = "";
  try {
    const decoded = atob(header.slice("Basic ".length));
    const sep = decoded.indexOf(":");
    user = decoded.slice(0, sep);
    pass = decoded.slice(sep + 1);
  } catch {
    return unauthorized();
  }

  if (user !== expectedUser || pass !== expectedPass) return unauthorized();

  return NextResponse.next();
}

export const config = {
  // Apply to everything except Next.js internals/static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
