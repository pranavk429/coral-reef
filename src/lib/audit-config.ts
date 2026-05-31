/**
 * Coral Reef configuration
 * Defines allowed sources and fallback SQL queries for demo reliability
 */

export const AUDIT_SOURCES = ["aws", "okta", "sentry", "notion", "jira"] as const

export type AuditSource = (typeof AUDIT_SOURCES)[number]

/**
 * Fallback SQL queries for controls when LLM-generated SQL fails after retry
 * These are vetted queries that provide meaningful cross-source evidence
 */
export const FALLBACK_SQL: Record<string, string> = {
  "CC6.1": `
    SELECT
      r.arn,
      r.role_name,
      s.user_email,
      s.mfa_used,
      s.last_login
    FROM aws.iam_roles r
    LEFT JOIN okta.sessions s ON r.arn = s.role_arn
    WHERE r.role_name LIKE '%admin%'
      AND (s.mfa_used = false OR s.mfa_used IS NULL)
    LIMIT 50
  `.trim(),

  "CC6.6": `
    SELECT
      s.issue_id,
      s.title,
      s.severity,
      p.title as policy_name
    FROM sentry.issues s
    LEFT JOIN notion.policies p ON s.severity = 'critical' AND p.title LIKE '%incident%'
    WHERE s.severity = 'critical' AND p.title IS NULL
    LIMIT 50
  `.trim(),

  "CC7.1": `
    SELECT
      s.issue_id,
      s.title,
      s.severity,
      s.status,
      s.first_seen,
      j.issue_key,
      j.status as ticket_status
    FROM sentry.issues s
    LEFT JOIN jira.issues j ON j.sentry_issue_id = s.issue_id
    WHERE s.severity = 'critical'
      AND s.status = 'unresolved'
      AND (j.issue_key IS NULL OR j.status != 'done')
    LIMIT 50
  `.trim(),

  "A.12.6.1": `
    SELECT
      s.issue_id,
      s.title,
      s.first_seen,
      s.status,
      j.issue_key,
      j.status as ticket_status,
      j.created as ticket_created
    FROM sentry.issues s
    LEFT JOIN jira.issues j ON j.sentry_issue_id = s.issue_id
    WHERE s.status = 'unresolved'
      AND s.first_seen < today() - INTERVAL 30 DAY
      AND (j.issue_key IS NULL OR j.status != 'done')
    LIMIT 50
  `.trim(),

  "A.9.2.1": `
    SELECT
      r.arn,
      r.role_name,
      u.email,
      u.role as user_role,
      t.title as training_title,
      t.status as training_status
    FROM aws.iam_roles r
    LEFT JOIN okta.users u ON r.arn LIKE '%' || SPLIT_PART(u.email, '@', 1) || '%'
    LEFT JOIN notion.training t ON u.email = t.assignee
    WHERE r.role_name LIKE '%admin%'
      AND (t.status != 'completed' OR t.status IS NULL)
    LIMIT 50
  `.trim(),

  "PCI-DSS 8.2.1": `
    SELECT
      email,
      name,
      role,
      mfa_enrolled
    FROM okta.users
    WHERE role = 'admin' AND mfa_enrolled = false
    LIMIT 50
  `.trim(),

  "PCI-DSS 8.2.2": `
    SELECT
      user_email,
      role_arn,
      last_login,
      mfa_used
    FROM okta.sessions
    WHERE (role_arn LIKE '%prod%' OR role_arn LIKE '%db%') AND mfa_used = false
    LIMIT 50
  `.trim(),
}

/**
 * Sanitize LLM-generated SQL before execution
 * Strips markdown fences and validates it's a SELECT statement
 */
export function sanitizeSQL(sql: string): string {
  // Strip markdown code fences
  let cleaned = sql.trim()
  if (cleaned.startsWith("```sql")) {
    cleaned = cleaned.slice(6)
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3)
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3)
  }
  cleaned = cleaned.trim()

  // Validate it's a SELECT statement
  const upperCleaned = cleaned.toUpperCase()
  if (!upperCleaned.startsWith("SELECT")) {
    throw new Error("Only SELECT statements are allowed")
  }

  // Reject dangerous keywords
  const dangerous = ["DROP", "DELETE", "INSERT", "UPDATE", "ALTER", "CREATE", "TRUNCATE"]
  for (const keyword of dangerous) {
    if (upperCleaned.includes(keyword)) {
      throw new Error(`Dangerous SQL keyword detected: ${keyword}`)
    }
  }

  return cleaned
}
