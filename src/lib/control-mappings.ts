import { Control } from "./types"

export const CONTROLS: Control[] = [
  {
    id: "CC6.1",
    framework: "SOC2",
    description: "Production access requires MFA authentication",
    intent:
      "Find all production AWS instances where the assigned admin users did not use MFA in their last login session. Join aws.iam_roles with okta.sessions on the role ARN to identify sessions without MFA.",
    sourcesJoined: ["aws", "okta"],
  },
  {
    id: "CC6.6",
    framework: "SOC2",
    description: "Critical security incidents have a documented response procedure",
    intent:
      "Find all critical Sentry issues where there is no matching Notion policy for incident response. Left join sentry.issues with notion.policies and check for missing policy matches.",
    sourcesJoined: ["sentry", "notion"],
  },
  {
    id: "CC7.1",
    framework: "SOC2",
    description: "Unresolved critical errors must have remediation tickets",
    intent:
      "Find all unresolved critical Sentry issues that do not have a corresponding Jira remediation ticket. Left join sentry.issues with jira.issues.",
    sourcesJoined: ["sentry", "jira"],
  },
  {
    id: "A.12.6.1",
    framework: "ISO_27001",
    description: "Known vulnerabilities must be reviewed within 30 days",
    intent:
      "Find Sentry issues older than 30 days that are still unresolved and have no open Jira remediation ticket. Join sentry.issues with jira.issues on linked control or description match.",
    sourcesJoined: ["sentry", "jira"],
  },
  {
    id: "A.9.2.1",
    framework: "ISO_27001",
    description: "Users with admin roles must have completed security training",
    intent:
      "Find all admin-role users where their security training status is not 'completed'. Join aws.iam_roles with okta.users and notion.training on user email.",
    sourcesJoined: ["aws", "okta", "notion"],
  },
  {
    id: "PCI-DSS 8.2.1",
    framework: "PCI_DSS",
    description: "Administrator accounts must have multi-factor authentication (MFA) enrolled",
    intent:
      "Find all Okta users with an administrator role who are not enrolled in MFA. Query okta.users for users where role = 'admin' and mfa_enrolled = false.",
    sourcesJoined: ["okta"],
  },
  {
    id: "PCI-DSS 8.2.2",
    framework: "PCI_DSS",
    description: "Active production sessions must use MFA authentication",
    intent:
      "Find all active Okta sessions on production or database AWS roles where MFA was not used in the session. Query okta.sessions for sessions on roles containing 'prod' or 'db' where mfa_used = false.",
    sourcesJoined: ["okta"],
  },
]

export function getControlsByFramework(frameworks: string[]): Control[] {
  return CONTROLS.filter((c) => frameworks.includes(c.framework))
}
