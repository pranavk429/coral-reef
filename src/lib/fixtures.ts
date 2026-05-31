type FixtureKey = `${string}/${string}`

const FIXTURES: Record<FixtureKey, Record<string, unknown>[]> = {
  "aws/ec2": [
    { instance_id: "i-0abcd1234efgh5678", name: "prod-api-01", environment: "production", arn: "arn:aws:ec2:us-east-1:123456789012:instance/i-0abcd1234efgh5678", admin_role: "arn:aws:iam::123456789012:role/prod-admin", state: "running" },
    { instance_id: "i-0bcde2345fghi6789", name: "prod-web-01", environment: "production", arn: "arn:aws:ec2:us-east-1:123456789012:instance/i-0bcde2345fghi6789", admin_role: "arn:aws:iam::123456789012:role/prod-admin", state: "running" },
    { instance_id: "i-0cdef3456ghij7890", name: "staging-api-01", environment: "staging", arn: "arn:aws:ec2:us-east-1:123456789012:instance/i-0cdef3456ghij7890", admin_role: "arn:aws:iam::123456789012:role/staging-admin", state: "running" },
    { instance_id: "i-0defg4567hijk8901", name: "prod-db-01", environment: "production", arn: "arn:aws:ec2:us-east-1:123456789012:instance/i-0defg4567hijk8901", admin_role: "arn:aws:iam::123456789012:role/db-admin", state: "running" },
    { instance_id: "i-0efgh5678ijkl9012", name: "prod-worker-01", environment: "production", arn: "arn:aws:ec2:us-east-1:123456789012:instance/i-0efgh5678ijkl9012", admin_role: "arn:aws:iam::123456789012:role/prod-admin", state: "running" },
    { instance_id: "i-0fghi6789jklm0123", name: "prod-cache-01", environment: "production", arn: "arn:aws:ec2:us-east-1:123456789012:instance/i-0fghi6789jklm0123", admin_role: "arn:aws:iam::123456789012:role/prod-admin", state: "stopped" },
    { instance_id: "i-0ghij7890klmn1234", name: "dev-api-01", environment: "development", arn: "arn:aws:ec2:us-east-1:123456789012:instance/i-0ghij7890klmn1234", admin_role: "arn:aws:iam::123456789012:role/dev-admin", state: "running" },
  ],
  "aws/iam_roles": [
    { role_name: "prod-admin", arn: "arn:aws:iam::123456789012:role/prod-admin", assigned_users: "alice@corp.com,bob@corp.com", environment: "production" },
    { role_name: "staging-admin", arn: "arn:aws:iam::123456789012:role/staging-admin", assigned_users: "charlie@corp.com", environment: "staging" },
    { role_name: "db-admin", arn: "arn:aws:iam::123456789012:role/db-admin", assigned_users: "diana@corp.com", environment: "production" },
    { role_name: "dev-admin", arn: "arn:aws:iam::123456789012:role/dev-admin", assigned_users: "eve@corp.com", environment: "development" },
    { role_name: "security-auditor", arn: "arn:aws:iam::123456789012:role/security-auditor", assigned_users: "frank@corp.com", environment: "production" },
  ],
  "okta/users": [
    { email: "alice@corp.com", name: "Alice Smith", role: "admin", department: "Engineering", mfa_enrolled: true },
    { email: "bob@corp.com", name: "Bob Jones", role: "admin", department: "Engineering", mfa_enrolled: false },
    { email: "charlie@corp.com", name: "Charlie Brown", role: "developer", department: "Engineering", mfa_enrolled: true },
    { email: "diana@corp.com", name: "Diana Prince", role: "admin", department: "DevOps", mfa_enrolled: true },
    { email: "eve@corp.com", name: "Eve Adams", role: "developer", department: "Engineering", mfa_enrolled: false },
    { email: "frank@corp.com", name: "Frank Castle", role: "auditor", department: "Security", mfa_enrolled: true },
  ],
  "okta/sessions": [
    { user_email: "alice@corp.com", role_arn: "arn:aws:iam::123456789012:role/prod-admin", last_login: "2026-05-27T08:30:00Z", mfa_used: true },
    { user_email: "bob@corp.com", role_arn: "arn:aws:iam::123456789012:role/prod-admin", last_login: "2026-05-27T09:00:00Z", mfa_used: false },
    { user_email: "diana@corp.com", role_arn: "arn:aws:iam::123456789012:role/db-admin", last_login: "2026-05-26T14:00:00Z", mfa_used: true },
    { user_email: "charlie@corp.com", role_arn: "arn:aws:iam::123456789012:role/staging-admin", last_login: "2026-05-25T11:00:00Z", mfa_used: true },
    { user_email: "eve@corp.com", role_arn: "arn:aws:iam::123456789012:role/dev-admin", last_login: "2026-05-27T07:00:00Z", mfa_used: false },
  ],
  "sentry/issues": [
    { issue_id: "SENTRY-1001", title: "NullPointerException in payment checkout", severity: "critical", resource_arn: "arn:aws:ec2:us-east-1:123456789012:instance/i-0abcd1234efgh5678", release_version: "v2.3.1", first_seen: "2026-05-26T14:30:00Z", status: "unresolved" },
    { issue_id: "SENTRY-1002", title: "Memory leak in image processing worker", severity: "error", resource_arn: "arn:aws:ec2:us-east-1:123456789012:instance/i-0efgh5678ijkl9012", release_version: "v2.3.0", first_seen: "2026-04-15T10:00:00Z", status: "unresolved" },
    { issue_id: "SENTRY-1003", title: "Database connection timeout on prod-db", severity: "critical", resource_arn: "arn:aws:ec2:us-east-1:123456789012:instance/i-0defg4567hijk8901", release_version: "v2.3.1", first_seen: "2026-05-27T06:00:00Z", status: "unresolved" },
    { issue_id: "SENTRY-1004", title: "Rate limiting triggered on API gateway", severity: "warning", resource_arn: "arn:aws:ec2:us-east-1:123456789012:instance/i-0bcde2345fghi6789", release_version: "v2.3.0", first_seen: "2026-05-20T12:00:00Z", status: "resolved" },
    { issue_id: "SENTRY-1005", title: "Authentication token expiry in web service", severity: "error", resource_arn: "arn:aws:ec2:us-east-1:123456789012:instance/i-0bcde2345fghi6789", release_version: "v2.2.9", first_seen: "2026-03-01T09:00:00Z", status: "unresolved" },
  ],
  "notion/policies": [
    { policy_id: "POL-001", title: "Incident Response Procedure", control_id: "CC6.6", last_reviewed: "2026-01-15", status: "active" },
    { policy_id: "POL-002", title: "Production Access Control Policy", control_id: "CC6.1", last_reviewed: "2026-02-01", status: "active" },
    { policy_id: "POL-003", title: "Vulnerability Management Policy", control_id: "A.12.6.1", last_reviewed: "2025-11-01", status: "needs_update" },
    { policy_id: "POL-004", title: "Security Training Policy", control_id: "A.9.2.1", last_reviewed: "2026-01-20", status: "active" },
    { policy_id: "POL-005", title: "Remediation Tracking Policy", control_id: "CC7.1", last_reviewed: "2026-03-10", status: "active" },
  ],
  "notion/training": [
    { training_id: "TR-001", title: "Security Awareness Q1 2026", assignee: "alice@corp.com", status: "completed", due_date: "2026-03-31" },
    { training_id: "TR-002", title: "Security Awareness Q1 2026", assignee: "bob@corp.com", status: "in_progress", due_date: "2026-03-31" },
    { training_id: "TR-003", title: "Security Awareness Q1 2026", assignee: "diana@corp.com", status: "completed", due_date: "2026-03-31" },
    { training_id: "TR-004", title: "Incident Response Training", assignee: "alice@corp.com", status: "completed", due_date: "2026-04-30" },
    { training_id: "TR-005", title: "Incident Response Training", assignee: "bob@corp.com", status: "not_started", due_date: "2026-04-30" },
    { training_id: "TR-006", title: "Security Awareness Q1 2026", assignee: "charlie@corp.com", status: "completed", due_date: "2026-03-31" },
    { training_id: "TR-007", title: "Security Awareness Q1 2026", assignee: "eve@corp.com", status: "not_started", due_date: "2026-03-31" },
  ],
  "jira/issues": [
    { issue_key: "SEC-100", summary: "Enforce MFA on all production EC2 admin sessions", status: "open", assignee: "bob@corp.com", created: "2026-05-01", due_date: "2026-06-15", linked_control: "CC6.1", sentry_issue_id: null },
    { issue_key: "SEC-101", summary: "Document incident response for critical Sentry errors", status: "in_progress", assignee: "alice@corp.com", created: "2026-05-10", due_date: "2026-05-30", linked_control: "CC6.6", sentry_issue_id: null },
    { issue_key: "SEC-102", summary: "Review and patch memory leak in image worker", status: "done", assignee: "charlie@corp.com", created: "2026-04-20", due_date: "2026-05-01", linked_control: "A.12.6.1", sentry_issue_id: "SENTRY-1002" },
    { issue_key: "SEC-103", summary: "Update vulnerability management policy", status: "open", assignee: "frank@corp.com", created: "2026-05-15", due_date: "2026-06-01", linked_control: "A.12.6.1", sentry_issue_id: null },
    { issue_key: "SEC-104", summary: "Investigate and fix NullPointerException in checkout", status: "in_progress", assignee: "charlie@corp.com", created: "2026-05-26", due_date: "2026-06-02", linked_control: "CC7.1", sentry_issue_id: "SENTRY-1001" },
  ],
}

export function getFixtureData(schema: string, table: string): Record<string, unknown>[] {
  const key = `${schema}/${table}` as FixtureKey
  return FIXTURES[key] ?? []
}
