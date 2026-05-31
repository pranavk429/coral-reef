# Coral Reef

Multi-agent compliance auditing system powered by [Coral](https://withcoral.com). Automates SOC 2, ISO 27001, and PCI DSS evidence collection by writing cross-source SQL queries across your enterprise tool stack.

Built for the [Pirates of the Coral-bean](https://www.wemakedevs.org/hackathons/coral) hackathon by WeMakeDevs.

**Live demo**: [https://coral2.vercel.app](https://coral2.vercel.app)

## How It Works

1. **Schema Scout** discovers available Coral sources and their schemas
2. **Evidence Gatherer** uses an LLM to write precise SQL queries for each compliance control
3. **Report Weaver** analyzes results and produces structured findings (PASS/FAIL)
4. **Remediation Engine** creates tickets for failed controls

All agents coordinate through a Supervisor with isolated context windows — no single agent holds all the context.

## Try It Live

Visit **[https://coral2.vercel.app](https://coral2.vercel.app)**, enter an OpenRouter API key in the sidebar (or set the `OPENROUTER_API_KEY` environment variable), select your compliance frameworks, and click **Run Audit**.

The app uses a built-in mock SQL engine — no database or CLI binary required.

## Environment Variables

- `OPENROUTER_API_KEY` - Required. Get one at https://openrouter.ai/keys
- `CORAL_PATH` - Optional. Path to Coral binary (defaults to `/opt/homebrew/bin/coral`)

## Compliance Controls

| ID | Framework | Description | Sources Joined |
|---|---|---|---|---|
| CC6.1 | SOC2 | Production access requires MFA | AWS × Okta |
| CC6.6 | SOC2 | Critical incidents have documented response | Sentry × Notion |
| CC7.1 | SOC2 | Unresolved critical errors have tickets | Sentry × Jira |
| A.12.6.1 | ISO 27001 | Vulnerabilities reviewed within 30 days | Sentry × Jira |
| A.9.2.1 | ISO 27001 | Admin roles require completed training | AWS × Okta × Notion |
| PCI-DSS 8.2.1 | PCI_DSS | Admin accounts must have MFA enrolled | Okta |
| PCI-DSS 8.2.2 | PCI_DSS | Production sessions must use MFA | Okta |

## Architecture

```
User → Supervisor → Schema Scout → Evidence Gatherer → Report Weaver → Remediation Engine
                          ↓                ↓                  ↓                ↓
                     Mock Engine     Mock Engine + LLM    LLM Analysis     Mock Tickets
```

The **Mock Engine** is a pure TypeScript SQL query interpreter that reads JSONL fixture data from `coral/fixtures/`. On platforms where the Coral CLI is unavailable (Vercel), it seamlessly falls back to an in-memory copy of the same fixture data — no database or binary required.

## Tech Stack

- **Framework**: Next.js 16, React 19
- **Styling**: Tailwind CSS v4, Framer Motion
- **AI**: DeepSeek V4 Flash via OpenRouter (configurable)
- **Data**: Coral CLI (local) or in-memory mock engine (Vercel) with JSONL fixtures

## Run Locally

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local and add your OPENROUTER_API_KEY
npm run dev
```

For local SQL debugging with the real Coral CLI:

```bash
brew install withcoral/tap/coral
./register-sources.sh
coral source list
```

When Coral CLI is not found, the app seamlessly falls back to the in-memory mock engine.

---

*Built with AI assistance. Powered by Coral.*
