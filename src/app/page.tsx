"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield,
  Play,
  Square,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Database,
  FileText,
  Ticket,
  Search,
  Cpu,
  Loader2,
} from "lucide-react"
import { clsx } from "clsx"

import type { AgentEvent, Finding, AuditResult } from "@/lib/types"

const AGENT_ICONS: Record<string, React.ReactNode> = {
  "schema-scout": <Search className="w-3.5 h-3.5" />,
  "evidence-gatherer": <Database className="w-3.5 h-3.5" />,
  "report-weaver": <FileText className="w-3.5 h-3.5" />,
  "remediation-engine": <Ticket className="w-3.5 h-3.5" />,
  supervisor: <Cpu className="w-3.5 h-3.5" />,
}

const AGENT_COLORS: Record<string, string> = {
  "schema-scout": "bg-purple-100 text-purple-700 border-purple-200",
  "evidence-gatherer": "bg-blue-100 text-blue-700 border-blue-200",
  "report-weaver": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "remediation-engine": "bg-amber-100 text-amber-700 border-amber-200",
  supervisor: "bg-slate-100 text-slate-700 border-slate-200",
}

const AGENT_LABELS: Record<string, string> = {
  "schema-scout": "Schema Scout",
  "evidence-gatherer": "Evidence Gatherer",
  "report-weaver": "Report Weaver",
  "remediation-engine": "Remediation Engine",
  supervisor: "Supervisor",
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function FindingRow({
  finding,
  defaultOpen,
}: {
  finding: Finding
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen ?? false)

  return (
    <div className="clickup-card overflow-hidden mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left clickup-interactive-row border-b border-transparent hover:border-slate-100"
      >
        {open ? (
          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
        )}
        <span className="font-mono text-xs text-slate-500 w-20 shrink-0">
          {finding.controlId}
        </span>
        <span className={clsx(
          "text-[11px] font-medium px-2.5 py-0.5 rounded-full shrink-0",
          finding.status === "pass" && "bg-green-100 text-green-800",
          finding.status === "fail" && "bg-red-100 text-red-800",
          finding.status === "error" && "bg-amber-100 text-amber-800"
        )}>
          {finding.status.toUpperCase()}
        </span>
        <span className="text-sm font-medium text-slate-900 truncate flex-1">
          {finding.description}
        </span>
        <span className="text-xs text-slate-500 shrink-0 font-medium bg-slate-100 px-2 py-1 rounded">
          {finding.rawRows.length} rows
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-50 border-t border-slate-100"
          >
            <div className="px-4 pb-4 pt-4 space-y-4">
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Evidence</div>
                <p className="text-sm text-slate-700">{finding.evidence}</p>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5">SQL Query</div>
                <pre className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg p-3 overflow-x-auto shadow-sm">
                  {finding.sqlQuery}
                </pre>
              </div>
              {finding.rawRows.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Raw Results</div>
                  <pre className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg p-3 overflow-x-auto max-h-40 overflow-y-auto shadow-sm">
                    {JSON.stringify(finding.rawRows, null, 2)}
                  </pre>
                </div>
              )}
              {finding.remediationTicket && (
                <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 w-fit">
                  <Ticket className="w-4 h-4" />
                  Remediation: {finding.remediationTicket}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AgentFeed({ events }: { events: AgentEvent[] }) {
  const feedEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [events])

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
      {events.map((event, i) => {
        const agentId = event.agentId
        const colorClass = AGENT_COLORS[agentId] ?? AGENT_COLORS.supervisor
        const icon = AGENT_ICONS[agentId]
        const label = AGENT_LABELS[agentId] ?? agentId

        // Check if this is a retry/warning event (not a terminal error)
        const isRetry = event.payload.retry === true || event.payload.recovered === true
        const isError = event.type === "error" && !isRetry

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={clsx(
              "flex items-start gap-3 p-3 rounded-lg text-sm clickup-card",
              isError ? "bg-red-50 border-red-200" : ""
            )}
          >
            <span className={clsx("flex items-center justify-center w-7 h-7 rounded-md border shrink-0", colorClass)}>
              {icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-semibold text-slate-700">{label}</span>
                <span className="text-[11px] text-slate-400 font-medium">{formatTime(event.timestamp)}</span>
                {isRetry && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                    {event.payload.recovered ? "Recovered" : "Retry"}
                  </span>
                )}
              </div>
              <p className="text-slate-600 text-sm leading-snug">
                {event.payload.message as string ?? ""}
              </p>
              {(event.payload as { sqlQuery?: string }).sqlQuery && (
                <pre className="mt-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5 overflow-x-auto">
                  {(event.payload as { sqlQuery: string }).sqlQuery}
                </pre>
              )}
            </div>
          </motion.div>
        )
      })}
      <div ref={feedEndRef} />
    </div>
  )
}

export default function AuditWeaverPage() {
  const [frameworks, setFrameworks] = useState<string[]>(["SOC2"])
  const [provider] = useState("openrouter")
  const [model] = useState("deepseek/deepseek-v4-flash")
  const [running, setRunning] = useState(false)
  const [events, setEvents] = useState<AgentEvent[]>([])
  const [findings, setFindings] = useState<Finding[]>([])
  const [summary, setSummary] = useState<AuditResult["summary"] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [schemaTables, setSchemaTables] = useState<number>(0)
  const [schemaSources, setSchemaSources] = useState<number>(0)
  const abortRef = useRef<AbortController | null>(null)

  const handleRunAudit = useCallback(async () => {
    setRunning(true)
    setEvents([])
    setFindings([])
    setSummary(null)
    setError(null)
    setSchemaTables(0)
    setSchemaSources(0)

    const abort = new AbortController()
    abortRef.current = abort

    try {
      const response = await fetch("/api/agent/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frameworks, provider, model }),
        signal: abort.signal,
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error ?? "Failed to start audit")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response stream")

      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const json = line.slice(6)

          try {
            const parsed = JSON.parse(json)

            if (parsed.type === "event") {
              const event = parsed.event as AgentEvent
              setEvents((prev) => [...prev, event])

              if (event.type === "schema_scout_result") {
                const schema = event.payload.schema as { tables: { sourceName: string }[] }
                if (schema) {
                  setSchemaTables(schema.tables.length)
                  setSchemaSources(new Set(schema.tables.map((t) => t.sourceName)).size)
                }
              }

              if (event.type === "finding") {
                setFindings((prev) => [...prev, event.payload.finding as Finding])
              }
            }

            if (parsed.type === "complete") {
              const result = parsed.result as AuditResult
              setSummary(result.summary)
            }

            if (parsed.type === "error") {
              setError(parsed.message)
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setRunning(false)
      abortRef.current = null
    }
  }, [frameworks, provider, model])

  const handleStopAudit = useCallback(() => {
    abortRef.current?.abort()
    setRunning(false)
  }, [])

  const toggleFramework = (fw: string) => {
    setFrameworks((prev) =>
      prev.includes(fw) ? prev.filter((f) => f !== fw) : [...prev, fw]
    )
  }

  const passed = findings.filter((f) => f.status === "pass").length
  const failed = findings.filter((f) => f.status === "fail").length

  return (
    <div className="flex w-full h-full">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="h-16 flex items-center px-6 border-b border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold mr-3 shadow-sm">C</div>
              <span className="font-semibold text-lg tracking-tight text-slate-900">Coral Audit</span>
          </div>
          <div className="flex-1 py-6 px-4 space-y-1">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Navigation</div>
              <a href="#" className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-indigo-50 text-indigo-700">
                  Dashboard
              </a>
              
              <div className="mt-8 mb-3 px-2">
                 <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Frameworks</div>
              </div>
              <div className="space-y-1.5 px-2">
                {["SOC2", "ISO_27001"].map((fw) => (
                  <button
                    key={fw}
                    onClick={() => toggleFramework(fw)}
                    disabled={running}
                    className={clsx(
                      "w-full text-left px-3 py-2 rounded-lg text-sm font-medium border transition-all",
                      frameworks.includes(fw)
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {fw.replace("_", " ")}
                  </button>
                ))}
              </div>

              <div className="mt-8 mb-3 px-2">
                 <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Model Config</div>
              </div>
              <div className="px-2">
                 <div className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg truncate">
                    {model}
                 </div>
              </div>
          </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-[#F8F9FA]">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Audit Overview</h1>
            {running ? (
              <button
                onClick={handleStopAudit}
                className="clickup-btn-press flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-5 py-2.5 rounded-lg text-sm font-semibold border border-red-200"
              >
                <Square className="w-4 h-4 fill-current" />
                Stop Audit
              </button>
            ) : (
              <button
                onClick={handleRunAudit}
                disabled={frameworks.length === 0}
                className="clickup-btn-press flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                Run Audit
              </button>
            )}
        </header>

        <div className="p-8 max-w-6xl mx-auto space-y-8">
            {/* Scanning animation */}
            <AnimatePresence>
              {running && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative overflow-hidden rounded-xl bg-indigo-50 border border-indigo-100"
                >
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="w-full h-[2px] bg-indigo-500/20 animate-scan-line" />
                  </div>
                  <div className="relative p-4 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    <span className="text-sm font-medium text-indigo-900">Agent is auditing your infrastructure...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Audit Summary */}
            <AnimatePresence>
              {(summary || findings.length > 0) && (
                <div>
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Audit Summary</h2>
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
                  >
                    <div className="clickup-card p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-500 uppercase">Total</span>
                      </div>
                      <div className="text-3xl font-bold text-slate-900">{findings.length}</div>
                    </div>
                    <div className="clickup-card p-4 border-b-4 border-b-green-500">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-semibold text-slate-500 uppercase">Passed</span>
                      </div>
                      <div className="text-3xl font-bold text-slate-900">{passed}</div>
                    </div>
                    <div className="clickup-card p-4 border-b-4 border-b-red-500">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-semibold text-slate-500 uppercase">Failed</span>
                      </div>
                      <div className="text-3xl font-bold text-slate-900">{failed}</div>
                    </div>
                    <div className="clickup-card p-4 border-b-4 border-b-amber-400">
                      <div className="flex items-center gap-2 mb-2">
                        <Ticket className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-semibold text-slate-500 uppercase">Remediated</span>
                      </div>
                      <div className="text-3xl font-bold text-slate-900">{summary?.remediated ?? 0}</div>
                    </div>
                    {schemaTables > 0 && (
                      <div className="clickup-card p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-semibold text-slate-500 uppercase">Sources</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{schemaSources} <span className="text-sm font-medium text-slate-500">s</span> / {schemaTables} <span className="text-sm font-medium text-slate-500">t</span></div>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Agent Feed */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Agent Activity</h2>
                  </div>
                  {running && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse-dot" />
                      Live
                    </span>
                  )}
                </div>
                {events.length === 0 && !running ? (
                  <div className="clickup-card p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
                    <Cpu className="w-10 h-10 text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-slate-500">Select frameworks and run an audit</p>
                  </div>
                ) : (
                  <AgentFeed events={events} />
                )}
              </div>

              {/* Findings */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Findings</h2>
                    {findings.length > 0 && (
                      <span className="text-xs font-semibold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">{findings.length}</span>
                    )}
                  </div>
                </div>
                {findings.length === 0 && !running ? (
                  <div className="clickup-card p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
                    <Shield className="w-10 h-10 text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-slate-500">Findings will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {findings.map((finding, i) => (
                      <FindingRow key={i} finding={finding} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 mt-6"
                >
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-800">Audit Error</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
