import { NextResponse } from "next/server";
import { ScanError, scanWebsite } from "../../../lib/visibility-scan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= 8) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many scans. Wait a minute and try again." }, { status: 429 });
  }
  try {
    const body = await req.json();
    const url = typeof body?.url === "string" ? body.url : "";
    const result = await scanWebsite(url);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof ScanError ? error.message : "The scan could not be completed.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
