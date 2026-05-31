import { execFile } from "child_process"
import { promisify } from "util"
import { existsSync, readdirSync, readFileSync } from "fs"
import path from "path"
import { getFixtureData } from "@/lib/fixtures"

const execFileAsync = promisify(execFile)

function resolveCoralBin(): string {
  if (process.env.CORAL_PATH) {
    return process.env.CORAL_PATH
  }
  const candidates = [
    "/opt/homebrew/bin/coral",
    "/usr/local/bin/coral",
    "/usr/bin/coral",
  ]
  for (const path of candidates) {
    if (existsSync(path)) {
      return path
    }
  }
  return "coral"
}

const CORAL_BIN = resolveCoralBin()

export interface CoralQueryResult {
  columns: { name: string; type: string }[]
  rows: Record<string, unknown>[]
}

/**
 * Pure TypeScript mock query engine that parses JSONL fixtures directly.
 * Enables complete end-to-end demo functionality on serverless hosts like Vercel
 * where the local Coral CLI binary is not installed.
 */
function readJsonlFixture(schema: string, table: string): Record<string, unknown>[] {
  const inMemory = getFixtureData(schema, table)
  if (inMemory.length > 0) {
    return inMemory
  }

  try {
    const dirPath = path.join(process.cwd(), "coral/fixtures", schema, table)
    if (!existsSync(dirPath)) {
      console.warn(`[mock-coral] Directory not found: ${dirPath}`)
      return []
    }
    const files = readdirSync(dirPath)
    const jsonlFile = files.find((f) => f.endsWith(".jsonl"))
    if (!jsonlFile) {
      console.warn(`[mock-coral] No jsonl file found in: ${dirPath}`)
      return []
    }
    const content = readFileSync(path.join(dirPath, jsonlFile), "utf-8")
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => JSON.parse(line))
  } catch (err) {
    console.error(`[mock-coral] Failed to read fixture ${schema}.${table}:`, err)
    return []
  }
}

function executeMockQuery(query: string): CoralQueryResult {
  const cleanQuery = query.trim().replace(/\s+/g, " ")
  const upperQuery = cleanQuery.toUpperCase()

  console.log(`[mock-coral] Intercepted query: "${cleanQuery}"`)

  // 1. Describe tables
  if (upperQuery.includes("CORAL.TABLES")) {
    const rows = [
      { schema_name: "aws", table_name: "ec2" },
      { schema_name: "aws", table_name: "iam_roles" },
      { schema_name: "okta", table_name: "users" },
      { schema_name: "okta", table_name: "sessions" },
      { schema_name: "sentry", table_name: "issues" },
      { schema_name: "notion", table_name: "policies" },
      { schema_name: "notion", table_name: "training" },
      { schema_name: "jira", table_name: "issues" },
    ]
    return {
      columns: [
        { name: "schema_name", type: "Utf8" },
        { name: "table_name", type: "Utf8" },
      ],
      rows,
    }
  }

  // 2. Describe columns
  if (upperQuery.includes("CORAL.COLUMNS")) {
    // Parse table and schema out of query: schema_name = 'aws' AND table_name = 'ec2'
    const schemaMatch = cleanQuery.match(/schema_name\s*=\s*'([^']+)'/)
    const tableMatch = cleanQuery.match(/table_name\s*=\s*'([^']+)'/)
    const schema = schemaMatch ? schemaMatch[1] : ""
    const table = tableMatch ? tableMatch[1] : ""

    let columns: { name: string; type: string }[] = []
    if (schema === "aws" && table === "ec2") {
      columns = [
        { name: "instance_id", type: "Utf8" },
        { name: "name", type: "Utf8" },
        { name: "environment", type: "Utf8" },
        { name: "arn", type: "Utf8" },
        { name: "admin_role", type: "Utf8" },
        { name: "state", type: "Utf8" },
      ]
    } else if (schema === "aws" && table === "iam_roles") {
      columns = [
        { name: "role_name", type: "Utf8" },
        { name: "arn", type: "Utf8" },
        { name: "assigned_users", type: "Utf8" },
        { name: "environment", type: "Utf8" },
      ]
    } else if (schema === "okta" && table === "users") {
      columns = [
        { name: "email", type: "Utf8" },
        { name: "name", type: "Utf8" },
        { name: "role", type: "Utf8" },
        { name: "department", type: "Utf8" },
        { name: "mfa_enrolled", type: "Boolean" },
      ]
    } else if (schema === "okta" && table === "sessions") {
      columns = [
        { name: "user_email", type: "Utf8" },
        { name: "role_arn", type: "Utf8" },
        { name: "last_login", type: "Utf8" },
        { name: "mfa_used", type: "Boolean" },
      ]
    } else if (schema === "sentry" && table === "issues") {
      columns = [
        { name: "issue_id", type: "Utf8" },
        { name: "title", type: "Utf8" },
        { name: "severity", type: "Utf8" },
        { name: "resource_arn", type: "Utf8" },
        { name: "release_version", type: "Utf8" },
        { name: "first_seen", type: "Utf8" },
        { name: "status", type: "Utf8" },
      ]
    } else if (schema === "notion" && table === "policies") {
      columns = [
        { name: "policy_id", type: "Utf8" },
        { name: "title", type: "Utf8" },
        { name: "control_id", type: "Utf8" },
        { name: "last_reviewed", type: "Utf8" },
        { name: "status", type: "Utf8" },
      ]
    } else if (schema === "notion" && table === "training") {
      columns = [
        { name: "training_id", type: "Utf8" },
        { name: "title", type: "Utf8" },
        { name: "assignee", type: "Utf8" },
        { name: "status", type: "Utf8" },
        { name: "due_date", type: "Utf8" },
      ]
    } else if (schema === "jira" && table === "issues") {
      columns = [
        { name: "issue_key", type: "Utf8" },
        { name: "summary", type: "Utf8" },
        { name: "status", type: "Utf8" },
        { name: "assignee", type: "Utf8" },
        { name: "created", type: "Utf8" },
        { name: "due_date", type: "Utf8" },
        { name: "linked_control", type: "Utf8" },
        { name: "sentry_issue_id", type: "Utf8" },
      ]
    }

    const rows = columns.map((c) => ({
      column_name: c.name,
      data_type: c.type,
    }))

    return {
      columns: [
        { name: "column_name", type: "Utf8" },
        { name: "data_type", type: "Utf8" },
      ],
      rows,
    }
  }

  // 3. SOC2 CC6.1 - Production access requires MFA
  if (upperQuery.includes("AWS.IAM_ROLES") && upperQuery.includes("OKTA.SESSIONS")) {
    const roles = readJsonlFixture("aws", "iam_roles")
    const sessions = readJsonlFixture("okta", "sessions")
    const rows: Record<string, unknown>[] = []

    for (const r of roles) {
      if (String(r.role_name).includes("admin")) {
        const matchingSessions = sessions.filter((s) => s.role_arn === r.arn)
        if (matchingSessions.length === 0) {
          rows.push({
            arn: r.arn,
            role_name: r.role_name,
            user_email: null,
            mfa_used: null,
            last_login: null,
          })
        } else {
          for (const s of matchingSessions) {
            if (s.mfa_used === false || s.mfa_used === null) {
              rows.push({
                arn: r.arn,
                role_name: r.role_name,
                user_email: s.user_email,
                mfa_used: s.mfa_used,
                last_login: s.last_login,
              })
            }
          }
        }
      }
    }

    return {
      columns: [
        { name: "arn", type: "Utf8" },
        { name: "role_name", type: "Utf8" },
        { name: "user_email", type: "Utf8" },
        { name: "mfa_used", type: "Boolean" },
        { name: "last_login", type: "Utf8" },
      ],
      rows,
    }
  }

  // 4. SOC2 CC6.6 - Critical security incidents have response policies
  if (upperQuery.includes("SENTRY.ISSUES") && upperQuery.includes("NOTION.POLICIES")) {
    const sentry = readJsonlFixture("sentry", "issues")
    const policies = readJsonlFixture("notion", "policies")
    const rows: Record<string, unknown>[] = []

    for (const s of sentry) {
      if (s.severity === "critical") {
        // Case-sensitive "incident" check to match exact Coral CLI SQL LIKE behavior
        const hasIncidentPolicy = policies.some((p) => String(p.title).includes("incident"))
        if (!hasIncidentPolicy) {
          rows.push({
            issue_id: s.issue_id,
            title: s.title,
            severity: s.severity,
            policy_name: null,
          })
        }
      }
    }

    return {
      columns: [
        { name: "issue_id", type: "Utf8" },
        { name: "title", type: "Utf8" },
        { name: "severity", type: "Utf8" },
        { name: "policy_name", type: "Utf8" },
      ],
      rows,
    }
  }

  // 5. ISO 27001 A.12.6.1 - Vulnerabilities older than 30 days
  if (
    upperQuery.includes("SENTRY.ISSUES") &&
    upperQuery.includes("JIRA.ISSUES") &&
    (upperQuery.includes("30") || upperQuery.includes("JULIANDAY"))
  ) {
    const sentry = readJsonlFixture("sentry", "issues")
    const jira = readJsonlFixture("jira", "issues")
    const rows: Record<string, unknown>[] = []

    // 30 days ago calculation
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    for (const s of sentry) {
      const firstSeenDate = new Date(s.first_seen as string)
      if (s.status === "unresolved" && firstSeenDate < thirtyDaysAgo) {
        const matchingJira = jira.filter((j) => j.sentry_issue_id === s.issue_id)
        if (matchingJira.length === 0) {
          rows.push({
            issue_id: s.issue_id,
            title: s.title,
            first_seen: s.first_seen,
            status: s.status,
            issue_key: null,
            ticket_status: null,
            ticket_created: null,
          })
        } else {
          for (const j of matchingJira) {
            if (j.status !== "done") {
              rows.push({
                issue_id: s.issue_id,
                title: s.title,
                first_seen: s.first_seen,
                status: s.status,
                issue_key: j.issue_key,
                ticket_status: j.status,
                ticket_created: j.created,
              })
            }
          }
        }
      }
    }

    return {
      columns: [
        { name: "issue_id", type: "Utf8" },
        { name: "title", type: "Utf8" },
        { name: "first_seen", type: "Utf8" },
        { name: "status", type: "Utf8" },
        { name: "issue_key", type: "Utf8" },
        { name: "ticket_status", type: "Utf8" },
        { name: "ticket_created", type: "Utf8" },
      ],
      rows,
    }
  }

  // 6. SOC2 CC7.1 - Unresolved critical Sentry errors have Jira tickets
  if (upperQuery.includes("SENTRY.ISSUES") && upperQuery.includes("JIRA.ISSUES")) {
    const sentry = readJsonlFixture("sentry", "issues")
    const jira = readJsonlFixture("jira", "issues")
    const rows: Record<string, unknown>[] = []

    for (const s of sentry) {
      if (s.severity === "critical" && s.status === "unresolved") {
        const matchingJira = jira.filter((j) => j.sentry_issue_id === s.issue_id)
        if (matchingJira.length === 0) {
          rows.push({
            issue_id: s.issue_id,
            title: s.title,
            severity: s.severity,
            status: s.status,
            first_seen: s.first_seen,
            issue_key: null,
            ticket_status: null,
          })
        } else {
          for (const j of matchingJira) {
            if (j.status !== "done") {
              rows.push({
                issue_id: s.issue_id,
                title: s.title,
                severity: s.severity,
                status: s.status,
                first_seen: s.first_seen,
                issue_key: j.issue_key,
                ticket_status: j.status,
              })
            }
          }
        }
      }
    }

    return {
      columns: [
        { name: "issue_id", type: "Utf8" },
        { name: "title", type: "Utf8" },
        { name: "severity", type: "Utf8" },
        { name: "status", type: "Utf8" },
        { name: "first_seen", type: "Utf8" },
        { name: "issue_key", type: "Utf8" },
        { name: "ticket_status", type: "Utf8" },
      ],
      rows,
    }
  }

  // 7. ISO 27001 A.9.2.1 - Admin roles require training
  if (
    upperQuery.includes("AWS.IAM_ROLES") &&
    upperQuery.includes("OKTA.USERS") &&
    upperQuery.includes("NOTION.TRAINING")
  ) {
    const roles = readJsonlFixture("aws", "iam_roles")
    const users = readJsonlFixture("okta", "users")
    const training = readJsonlFixture("notion", "training")
    const rows: Record<string, unknown>[] = []

    for (const r of roles) {
      if (String(r.role_name).includes("admin")) {
        const matchingUsers = users.filter((u) => {
          const username = String(u.email).split("@")[0]
          return String(r.arn).includes(username)
        })
        if (matchingUsers.length === 0) {
          rows.push({
            arn: r.arn,
            role_name: r.role_name,
            email: null,
            user_role: null,
            training_title: null,
            training_status: null,
          })
        } else {
          for (const u of matchingUsers) {
            const userTrainings = training.filter((t) => t.assignee === u.email)
            if (userTrainings.length === 0) {
              rows.push({
                arn: r.arn,
                role_name: r.role_name,
                email: u.email,
                user_role: u.role,
                training_title: null,
                training_status: null,
              })
            } else {
              for (const t of userTrainings) {
                if (t.status !== "completed") {
                  rows.push({
                    arn: r.arn,
                    role_name: r.role_name,
                    email: u.email,
                    user_role: u.role,
                    training_title: t.title,
                    training_status: t.status,
                  })
                }
              }
            }
          }
        }
      }
    }

    return {
      columns: [
        { name: "arn", type: "Utf8" },
        { name: "role_name", type: "Utf8" },
        { name: "email", type: "Utf8" },
        { name: "user_role", type: "Utf8" },
        { name: "training_title", type: "Utf8" },
        { name: "training_status", type: "Utf8" },
      ],
      rows,
    }
  }

  // PCI-DSS 8.2.1 - Administrator accounts must have MFA enrolled
  if (upperQuery.includes("OKTA.USERS") && upperQuery.includes("MFA_ENROLLED = FALSE") && upperQuery.includes("ROLE = 'ADMIN'")) {
    const users = readJsonlFixture("okta", "users")
    const rows = users
      .filter((u) => u.role === "admin" && u.mfa_enrolled === false)
      .map((u) => ({
        email: u.email,
        name: u.name,
        role: u.role,
        mfa_enrolled: u.mfa_enrolled,
      }))
    return {
      columns: [
        { name: "email", type: "Utf8" },
        { name: "name", type: "Utf8" },
        { name: "role", type: "Utf8" },
        { name: "mfa_enrolled", type: "Boolean" },
      ],
      rows,
    }
  }

  // PCI-DSS 8.2.2 - Active production sessions must use MFA authentication
  if (upperQuery.includes("OKTA.SESSIONS") && upperQuery.includes("MFA_USED = FALSE")) {
    const sessions = readJsonlFixture("okta", "sessions")
    const rows = sessions
      .filter((s) => {
        const arn = String(s.role_arn)
        return (arn.includes("prod") || arn.includes("db")) && s.mfa_used === false
      })
      .map((s) => ({
        user_email: s.user_email,
        role_arn: s.role_arn,
        last_login: s.last_login,
        mfa_used: s.mfa_used,
      }))
    return {
      columns: [
        { name: "user_email", type: "Utf8" },
        { name: "role_arn", type: "Utf8" },
        { name: "last_login", type: "Utf8" },
        { name: "mfa_used", type: "Boolean" },
      ],
      rows,
    }
  }

  // 8. General single-table fallbacks (e.g. AWS.EC2)
  const singleTableMatch = cleanQuery.match(/FROM\s+([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/i)
  if (singleTableMatch) {
    const schema = singleTableMatch[1].toLowerCase()
    const table = singleTableMatch[2].toLowerCase()
    const rows = readJsonlFixture(schema, table)
    if (rows.length > 0) {
      return {
        columns: Object.keys(rows[0]).map((name) => ({ name, type: "Utf8" })),
        rows,
      }
    }
  }

  // Generic Empty Result
  return {
    columns: [],
    rows: [],
  }
}

export async function runCoralQuery(query: string): Promise<CoralQueryResult> {
  try {
    const { stdout, stderr } = await execFileAsync(CORAL_BIN, [
      "sql",
      "--format",
      "json",
      query,
    ])

    if (stderr) {
      console.warn("[coral stderr]", stderr)
    }

    const parsed = JSON.parse(stdout)

    if (parsed.error) {
      throw new Error(`Coral query error: ${parsed.error}`)
    }

    if (Array.isArray(parsed)) {
      const columns =
        parsed.length > 0
          ? Object.keys(parsed[0]).map((name) => ({ name, type: "Utf8" }))
          : []
      return { columns, rows: parsed }
    }

    return {
      columns: parsed.columns ?? [],
      rows: parsed.rows ?? [],
    }
  } catch (err) {
    // Graceful fallback to pure-JS mock query engine on cloud deployments (Vercel)
    const errMessage = err instanceof Error ? err.message : String(err)
    if (errMessage.includes("ENOENT") || errMessage.includes("not found") || errMessage.includes("Failed to execute Coral query")) {
      console.warn(`[coral] CLI binary execution failed or not installed. Falling back to in-memory JS engine. Error: ${errMessage}`)
      return executeMockQuery(query)
    }

    if (err instanceof Error && err.message.includes("Coral query error")) {
      throw err
    }
    throw new Error(
      `Failed to execute Coral query: ${err instanceof Error ? err.message : String(err)} (binary: ${CORAL_BIN})`
    )
  }
}

export async function describeCoralTables(
  allowedSources?: string[]
): Promise<
  { source: string; table: string; columns: { name: string; type: string }[] }[]
> {
  try {
    const result = await runCoralQuery("SELECT * FROM coral.tables")

    let tables: { source: string; table: string }[] = result.rows.map(
      (row: Record<string, unknown>) => ({
        source: String(row.schema_name ?? row.table_schema ?? row.source_name ?? ""),
        table: String(row.table_name ?? ""),
      })
    )

    // Filter to allowed sources if specified
    if (allowedSources && allowedSources.length > 0) {
      tables = tables.filter((t) => allowedSources.includes(t.source))
    }

    const descriptions: {
      source: string
      table: string
      columns: { name: string; type: string }[]
    }[] = []

    for (const t of tables) {
      try {
        const colResult = await runCoralQuery(
          `SELECT * FROM coral.columns WHERE schema_name = '${t.source}' AND table_name = '${t.table}'`
        )
        descriptions.push({
          source: t.source,
          table: t.table,
          columns: colResult.rows.map((r: Record<string, unknown>) => ({
            name: String(r.column_name ?? ""),
            type: String(r.data_type ?? r.type ?? "Utf8"),
          })),
        })
      } catch {
        descriptions.push({ source: t.source, table: t.table, columns: [] })
      }
    }

    return descriptions
  } catch (err) {
    console.error("[coral] Failed to describe tables:", err)
    return []
  }
}

