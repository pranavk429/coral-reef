import { Control, AgentEvent, AuditResult } from "@/lib/types"
import { getControlsByFramework } from "@/lib/control-mappings"
import { runSchemaScout } from "./schema-scout"
import { runEvidenceGatherer } from "./evidence-gatherer"
import { runReportWeaver } from "./report-weaver"
import { runRemediationEngine } from "./remediation-engine"

function createEventEmitter(
  controller: ReadableStreamDefaultController
): (event: AgentEvent) => void {
  return (event: AgentEvent) => {
    const message = `data: ${JSON.stringify({ type: "event", event })}\n\n`
    controller.enqueue(new TextEncoder().encode(message))
  }
}

interface EvidenceInput {
  control: Control
  sqlQuery: string
  rows: Record<string, unknown>[]
  success: boolean
  error?: string
}

async function callLLM(prompt: string, model: string, customApiKey?: string): Promise<string> {
  const apiKey = customApiKey || process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error(
      "OpenRouter API key is required. Please set OPENROUTER_API_KEY in your environment or enter your custom key in the dashboard sidebar."
    )
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4096,
      }),
    }
  )

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `OpenRouter API error (${response.status}): ${errorBody.slice(0, 200)}`
    )
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content ?? ""
}

export async function runAudit(
  frameworks: string[],
  provider: string,
  modelName: string,
  controller: ReadableStreamDefaultController,
  customApiKey?: string
): Promise<void> {
  const emit = createEventEmitter(controller)

  try {
    emit({
      type: "agent_thought",
      agentId: "supervisor",
      payload: {
        message: `Starting Coral Reef audit for frameworks: ${frameworks.join(", ")}`,
      },
      timestamp: new Date().toISOString(),
    })

    const controls = getControlsByFramework(frameworks)
    if (controls.length === 0) {
      throw new Error(`No controls found for frameworks: ${frameworks.join(", ")}`)
    }

    emit({
      type: "agent_thought",
      agentId: "supervisor",
      payload: {
        message: `Loaded ${controls.length} compliance controls to evaluate`,
        controls: controls.map((c) => ({ id: c.id, framework: c.framework })),
      },
      timestamp: new Date().toISOString(),
    })

    const model = modelName || "deepseek/deepseek-v4-flash"

    async function generateSql(prompt: string): Promise<string> {
      return callLLM(prompt, model, customApiKey)
    }

    async function analyze(prompt: string): Promise<string> {
      return callLLM(prompt, model, customApiKey)
    }

    const schema = await runSchemaScout(emit)

    if (schema.tables.length === 0) {
      throw new Error(
        "No tables discovered. Make sure Coral is installed and sources are configured."
      )
    }

    const evidenceResults: EvidenceInput[] = []

    for (const control of controls) {
      const result = await runEvidenceGatherer(control, schema, generateSql, emit)
      evidenceResults.push({
        control: control,
        sqlQuery: result.sqlQuery,
        rows: result.rows,
        success: result.success,
        error: result.error,
      })
    }

    const findings = await runReportWeaver(evidenceResults, analyze, emit)

    const failedFindings = findings.filter((f) => f.status === "fail")
    const remediationResults = await runRemediationEngine(failedFindings, emit)

    // Wire remediation tickets back into findings
    const findingsWithRemediation = findings.map((finding) => {
      if (finding.status === "fail") {
        const remediation = remediationResults.find((r) => r.controlId === finding.controlId)
        if (remediation?.ticketKey) {
          return { ...finding, remediationTicket: remediation.ticketKey }
        }
      }
      return finding
    })

    const result: AuditResult = {
      findings: findingsWithRemediation,
      summary: {
        total: findingsWithRemediation.length,
        passed: findingsWithRemediation.filter((f) => f.status === "pass").length,
        failed: failedFindings.length,
        remediated: remediationResults.length,
      },
    }

    emit({
      type: "complete",
      agentId: "supervisor",
      payload: {
        message: "Audit complete",
        result,
      },
      timestamp: new Date().toISOString(),
    })

    const completeMessage = `data: ${JSON.stringify({ type: "complete", result })}\n\n`
    controller.enqueue(new TextEncoder().encode(completeMessage))
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)

    emit({
      type: "error",
      agentId: "supervisor",
      payload: {
        message: errorMessage,
      },
      timestamp: new Date().toISOString(),
    })

    const errorData = `data: ${JSON.stringify({ type: "error", message: errorMessage })}\n\n`
    controller.enqueue(new TextEncoder().encode(errorData))
  } finally {
    controller.close()
  }
}
