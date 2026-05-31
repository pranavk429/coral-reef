import { Control, Finding, AgentEvent } from "@/lib/types"

interface EvidenceInput {
  control: Control
  sqlQuery: string
  rows: Record<string, unknown>[]
  success: boolean
  error?: string
}

export async function runReportWeaver(
  evidenceResults: EvidenceInput[],
  analyze: (prompt: string) => Promise<string>,
  emit: (event: AgentEvent) => void
): Promise<Finding[]> {
  emit({
    type: "agent_thought",
    agentId: "report-weaver",
    payload: {
      message: `Synthesizing ${evidenceResults.length} evidence results into compliance findings...`,
    },
    timestamp: new Date().toISOString(),
  })

  const findings: Finding[] = []

  for (const ev of evidenceResults) {
    const evidenceJson = JSON.stringify(
      {
        control: ev.control.id,
        description: ev.control.description,
        framework: ev.control.framework,
        sqlQuery: ev.sqlQuery,
        rows: ev.rows,
        querySuccess: ev.success,
        queryError: ev.error,
      },
      null,
      2
    )

    const analysisPrompt = `You are a compliance auditor. Analyze the following evidence for a compliance control and produce a structured finding.

${evidenceJson}

Determine:
1. Status: "pass" if the evidence shows compliance, "fail" if violations are found, "error" if the query failed
2. Evidence summary: A concise 1-2 sentence explanation of what the evidence shows
3. Remediation recommendation: If failed, what specific action should be taken

Return your response in this exact format:
STATUS: pass|fail|error
EVIDENCE: <your evidence summary>
REMEDIATION: <remediation recommendation if failed, or "none" if passed>`

    const analysis = await analyze(analysisPrompt)

    const statusMatch = analysis.match(/STATUS:\s*(pass|fail|error)/i)
    const evidenceMatch = analysis.match(/EVIDENCE:\s*(.+)/i)
    const remediationMatch = analysis.match(/REMEDIATION:\s*(.+)/i)

    const status = statusMatch
      ? (statusMatch[1].toLowerCase() as "pass" | "fail" | "error")
      : ev.success
        ? ev.rows.length > 0
          ? "fail"
          : "pass"
        : "error"

    const finding: Finding = {
      controlId: ev.control.id,
      framework: ev.control.framework,
      description: ev.control.description,
      status,
      evidence: evidenceMatch ? evidenceMatch[1].trim() : `${ev.rows.length} rows examined`,
      sqlQuery: ev.sqlQuery,
      rawRows: ev.rows,
      remediationAction:
        status === "fail" && remediationMatch
          ? remediationMatch[1].trim()
          : undefined,
    }

    findings.push(finding)

    emit({
      type: "finding",
      agentId: "report-weaver",
      payload: {
        finding,
        message: `${status.toUpperCase()}: ${ev.control.id} — ${finding.evidence}`,
      },
      timestamp: new Date().toISOString(),
    })
  }

  emit({
    type: "report",
    agentId: "report-weaver",
    payload: {
      message: `Generated ${findings.length} findings`,
      summary: {
        total: findings.length,
        passed: findings.filter((f) => f.status === "pass").length,
        failed: findings.filter((f) => f.status === "fail").length,
        error: findings.filter((f) => f.status === "error").length,
      },
    },
    timestamp: new Date().toISOString(),
  })

  return findings
}
