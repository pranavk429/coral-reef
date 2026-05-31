import { NextRequest } from "next/server"
import { runAudit } from "@/lib/agent/supervisor"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      frameworks = ["SOC2"],
      provider = "openrouter",
      model = "deepseek/deepseek-v4-flash",
      customApiKey = "",
    } = body

    if (!Array.isArray(frameworks) || frameworks.length === 0) {
      return new Response(JSON.stringify({ error: "At least one framework required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const stream = new ReadableStream({
      async start(controller) {
        await runAudit(frameworks, provider, model, controller, customApiKey)
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request"
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
}
