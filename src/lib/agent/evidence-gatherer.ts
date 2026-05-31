import { Control, Schema, AgentEvent } from "@/lib/types"
import { runCoralQuery } from "@/lib/coral"
import { sanitizeSQL, FALLBACK_SQL } from "@/lib/audit-config"

interface EvidenceResult {
  controlId: string
  sqlQuery: string
  rows: Record<string, unknown>[]
  success: boolean
  error?: string
}

function formatSchemaForPrompt(schema: Schema): string {
  return schema.tables
    .map(
      (t) =>
        `source: ${t.sourceName}, table: ${t.tableName}\n  columns: ${t.columns.map((c) => `${c.name} (${c.type})`).join(", ")}`
    )
    .join("\n")
}

export async function runEvidenceGatherer(
  control: Control,
  schema: Schema,
  generateSql: (prompt: string) => Promise<string>,
  emit: (event: AgentEvent) => void
): Promise<EvidenceResult> {
  emit({
    type: "evidence_start",
    agentId: "evidence-gatherer",
    payload: {
      controlId: control.id,
      description: control.description,
      message: `Gathering evidence for ${control.id}: ${control.description}`,
    },
    timestamp: new Date().toISOString(),
  })

  const schemaStr = formatSchemaForPrompt(schema)

  const sqlPrompt = `You are a compliance SQL expert. Given the following database schema and a compliance control, write a precise SQL query that gathers evidence for this control.

Available tables and columns:
${schemaStr}

Control: ${control.id}
Framework: ${control.framework}
Description: ${control.description}
Intent: ${control.intent}

Rules:
- Use the exact table names and column names shown above
- Return only the SQL query, no explanation, no markdown formatting, no code fences
- The query must use the format: source_name.table_name (e.g., aws.ec2)
- Use LEFT JOIN for controls that check for missing data
- If possible, include a pass/fail indicator column (1 for pass/fail condition, 0 otherwise)
- Use WHERE clauses to filter relevant data
- Limit results to 50 rows maximum
- The query must be a single SELECT statement`

  let sqlQuery: string
  try {
    sqlQuery = sanitizeSQL((await generateSql(sqlPrompt)).trim())
  } catch (sanitizeErr) {
    emit({
      type: "agent_thought",
      agentId: "evidence-gatherer",
      payload: {
        controlId: control.id,
        message: `SQL sanitization failed: ${sanitizeErr instanceof Error ? sanitizeErr.message : String(sanitizeErr)}`,
      },
      timestamp: new Date().toISOString(),
    })
    // Use fallback if available
    if (FALLBACK_SQL[control.id]) {
      sqlQuery = FALLBACK_SQL[control.id]
      emit({
        type: "agent_thought",
        agentId: "evidence-gatherer",
        payload: {
          controlId: control.id,
          message: `Using fallback SQL for ${control.id}`,
          sqlQuery,
        },
        timestamp: new Date().toISOString(),
      })
    } else {
      throw sanitizeErr
    }
  }

  emit({
    type: "agent_thought",
    agentId: "evidence-gatherer",
    payload: {
      controlId: control.id,
      message: `Generated SQL query for ${control.id}`,
      sqlQuery,
    },
    timestamp: new Date().toISOString(),
  })

  try {
    const result = await runCoralQuery(sqlQuery)

    emit({
      type: "evidence_result",
      agentId: "evidence-gatherer",
      payload: {
        controlId: control.id,
        sqlQuery,
        rowCount: result.rows.length,
        columns: result.columns,
        rows: result.rows,
      },
      timestamp: new Date().toISOString(),
    })

    return {
      controlId: control.id,
      sqlQuery,
      rows: result.rows,
      success: true,
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)

    emit({
      type: "agent_thought",
      agentId: "evidence-gatherer",
      payload: {
        controlId: control.id,
        error: errorMessage,
        message: `Query failed for ${control.id}, retrying with corrected SQL...`,
        retry: true,
      },
      timestamp: new Date().toISOString(),
    })

    const retryPrompt = `${sqlPrompt}

Your previous query failed with error: ${errorMessage}
Please fix the query and try again. Make sure to use the exact column names from the schema.`

    let retryQuery: string
    try {
      retryQuery = sanitizeSQL((await generateSql(retryPrompt)).trim())
    } catch (sanitizeFail) {
      // Retry sanitization failed, use fallback
      if (FALLBACK_SQL[control.id]) {
        retryQuery = FALLBACK_SQL[control.id]
        emit({
          type: "agent_thought",
          agentId: "evidence-gatherer",
          payload: {
            controlId: control.id,
            message: `Retry SQL sanitization failed, using fallback SQL for ${control.id}`,
            sqlQuery: retryQuery,
          },
          timestamp: new Date().toISOString(),
        })
      } else {
        return {
          controlId: control.id,
          sqlQuery: "",
          rows: [],
          success: false,
          error: `Both generated and retry SQL failed sanitization: ${sanitizeFail instanceof Error ? sanitizeFail.message : String(sanitizeFail)}`,
        }
      }
    }

    try {
      const result = await runCoralQuery(retryQuery)
      emit({
        type: "agent_thought",
        agentId: "evidence-gatherer",
        payload: {
          controlId: control.id,
          message: `Retry succeeded for ${control.id}`,
          recovered: true,
        },
        timestamp: new Date().toISOString(),
      })
      return {
        controlId: control.id,
        sqlQuery: retryQuery,
        rows: result.rows,
        success: true,
      }
    } catch (retryErr) {
      // Both attempts failed, try fallback
      if (FALLBACK_SQL[control.id]) {
        emit({
          type: "agent_thought",
          agentId: "evidence-gatherer",
          payload: {
            controlId: control.id,
            message: `Both generated queries failed, using fallback SQL for ${control.id}`,
            sqlQuery: FALLBACK_SQL[control.id],
          },
          timestamp: new Date().toISOString(),
        })
        try {
          const fallbackResult = await runCoralQuery(FALLBACK_SQL[control.id])
          return {
            controlId: control.id,
            sqlQuery: FALLBACK_SQL[control.id],
            rows: fallbackResult.rows,
            success: true,
          }
        } catch (fallbackErr) {
          return {
            controlId: control.id,
            sqlQuery: FALLBACK_SQL[control.id],
            rows: [],
            success: false,
            error: fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr),
          }
        }
      }
      return {
        controlId: control.id,
        sqlQuery: retryQuery,
        rows: [],
        success: false,
        error: retryErr instanceof Error ? retryErr.message : String(retryErr),
      }
    }
  }
}
