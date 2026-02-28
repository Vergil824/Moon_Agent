import { NextResponse } from "next/server";

type ChatRequestBody = {
  sessionId?: unknown;
  chatInput?: unknown;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
    const chatInput = typeof body.chatInput === "string" ? body.chatInput : "";

    if (!sessionId || !chatInput) {
      return NextResponse.json(
        { error: "Missing sessionId or chatInput" },
        { status: 400 }
      );
    }

    // Placeholder for authentication/authorization logic.
    // Replace this with real auth checks (e.g., Supabase user / session validation).
    if (isSessionBanned(sessionId)) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      console.error("N8N_WEBHOOK_URL is not defined");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/plain, application/json"
      },
      body: JSON.stringify({ sessionId, chatInput }),
    });

    // Stream proxy: forward ReadableStream directly (required by Story 1.3).
    const proxyHeaders = new Headers();
    const contentType = n8nResponse.headers.get("content-type");
    if (contentType) proxyHeaders.set("content-type", contentType);
    proxyHeaders.set("cache-control", "no-cache");

    return new Response(n8nResponse.body, {
      status: n8nResponse.status,
      headers: proxyHeaders
    });
  } catch (error) {
    console.error("Error in chat API route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function isSessionBanned(sessionId: string): boolean {
  // Implement your actual ban logic here.
  return sessionId === "bannedSession";
}
