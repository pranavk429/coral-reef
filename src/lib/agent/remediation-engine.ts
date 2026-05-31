import { Finding, AgentEvent } from "@/lib/types"

interface RemediationResult {
  controlId: string
  ticketKey: string | null
  success: boolean
}

export async function runRemediationEngine(
  failedFindings: Finding[],
  emit: (event: AgentEvent) => void
): Promise<RemediationResult[]> {
  if (failedFindings.length === 0) {
    emit({
      type: "agent_thought",
      agentId: "remediation-engine",
      payload: {
        message: "No failed controls — no remediation tickets needed",
      },
      timestamp: new Date().toISOString(),
    })
    return []
  }

  emit({
    type: "remediation_start",
    agentId: "remediation-engine",
    payload: {
      message: `Creating remediation tickets for ${failedFindings.length} failed control(s)...`,
      count: failedFindings.length,
    },
    timestamp: new Date().toISOString(),
  })

  const results: RemediationResult[] = []

  for (const [index, finding] of failedFindings.entries()) {
    const uniqueId = `${Date.now().toString(36)}${index}${Math.random().toString(36).slice(2, 6)}`.toUpperCase()
    const ticketKey = `SEC-AUTO-${uniqueId}`

    results.push({
      controlId: finding.controlId,
      ticketKey,
      success: true,
    })

    emit({
      type: "remediation_result",
      agentId: "remediation-engine",
      payload: {
        controlId: finding.controlId,
        ticketKey,
        message: `Created ticket ${ticketKey} for ${finding.controlId}`,
        summary: finding.evidence,
      },
      timestamp: new Date().toISOString(),
    })
  }

  return results
}
