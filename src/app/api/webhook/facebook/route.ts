import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json({ status: "ready", message: "Facebook Webhook Endpoint" });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[Facebook Webhook API Event]", JSON.stringify(body));
    return new Response("EVENT_RECEIVED", { status: 200 });
  } catch {
    return new Response("EVENT_RECEIVED", { status: 200 });
  }
}
