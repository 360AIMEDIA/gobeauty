import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    const city = typeof body?.city === "string" ? body.city.trim() : "";
    const state = typeof body?.state === "string" ? body.state.trim() : "";
    const category = typeof body?.category === "string" ? body.category.trim() : "";
    if (!email.includes("@") || email.length > 254 || !name || !url || !city || !state || !category) {
      return NextResponse.json({ ok: false, error: "Business, website, email, category, city, and state are required." }, { status: 400 });
    }
    console.log(JSON.stringify({
      source: "gobeauty.ai/ai-visibility",
      name: name.slice(0, 200),
      email,
      url: url.slice(0, 500),
      category: category.slice(0, 120),
      city: city.slice(0, 120),
      state,
      contactName: typeof body?.contactName === "string" ? body.contactName.trim().slice(0, 200) : "",
      submittedAt: new Date().toISOString()
    }));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "The follow-up could not be saved." }, { status: 400 });
  }
}
