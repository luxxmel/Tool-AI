import { NextRequest, NextResponse } from "next/server";

// Facebook Webhook Verification & Event Handler
// Hỗ trợ mọi URL webhook tùy chỉnh: /webhook/xxx hoặc /webhook
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  console.log("[Facebook Webhook GET Verification]", { mode, token, challenge });

  // Facebook gửi mode='subscribe' và challenge
  if (mode === "subscribe" && challenge) {
    // Trả về thẳng challenge dạng text/plain để Facebook xác minh thành công ngay lập tức
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
    console.log("[Facebook Webhook Event Received]", JSON.stringify(body));
    return new Response("EVENT_RECEIVED", { status: 200 });
  } catch {
    return new Response("EVENT_RECEIVED", { status: 200 });
  }
}
