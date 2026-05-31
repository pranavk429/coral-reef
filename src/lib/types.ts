export type ControlFramework = "SOC2" | "ISO_27001" | "PCI_DSS"

export interface Control {
  id: string
  framework: ControlFramework
  description: string
  intent: string
  sourcesJoined: string[]
}

export interface Finding {
  controlId: string
  framework: ControlFramework
  description: string
  status: "pass" | "fail" | "error"
  evidence: string
  sqlQuery: string
  rawRows: Record<string, unknown>[]
  remediationTicket?: string
  remediationAction?: string
}

export interface SchemaTable {
  sourceName: string
  tableName: string
  columns: { name: string; type: string }[]
}

export interface Schema {
  tables: SchemaTable[]
}

export type AgentId = "supervisor" | "schema-scout" | "evidence-gatherer" | "report-weaver" | "remediation-engine"

export interface AgentEvent {
  type:
    | "schema_scout_start"
    | "schema_scout_result"
    | "evidence_start"
    | "evidence_result"
    | "report"
    | "finding"
    | "remediation_start"
    | "remediation_result"
    | "complete"
    | "error"
    | "agent_thought"
  payload: Record<string, unknown>
  agentId: AgentId
  timestamp: string
}

export interface AuditResult {
  findings: Finding[]
  summary: {
    total: number
    passed: number
    failed: number
    remediated: number
  }
}

export interface StreamEvent {
  type: "event"
  event: AgentEvent
}

export interface StreamError {
  type: "error"
  message: string
}

export interface StreamComplete {
  type: "complete"
  result: AuditResult
}

export type StreamChunk = StreamEvent | StreamError | StreamComplete

export interface SourceConfig {
  name: string
  tables: {
    name: string
    columns: { name: string; type: string }[]
  }[]
}
