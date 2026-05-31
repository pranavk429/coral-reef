import { describeCoralTables } from "@/lib/coral"
import { Schema, AgentEvent } from "@/lib/types"
import { AUDIT_SOURCES } from "@/lib/audit-config"

export async function runSchemaScout(
  emit: (event: AgentEvent) => void
): Promise<Schema> {
  emit({
    type: "schema_scout_start",
    agentId: "schema-scout",
    payload: { message: "Discovering Coral data sources and schemas..." },
    timestamp: new Date().toISOString(),
  })

  const tables = await describeCoralTables([...AUDIT_SOURCES])

  const schema: Schema = {
    tables: tables.map((t) => ({
      sourceName: t.source,
      tableName: t.table,
      columns: t.columns.map((c) => ({ name: c.name, type: c.type })),
    })),
  }

  emit({
    type: "schema_scout_result",
    agentId: "schema-scout",
    payload: {
      message: `Discovered ${schema.tables.length} tables across ${new Set(schema.tables.map((t) => t.sourceName)).size} sources`,
      schema,
    },
    timestamp: new Date().toISOString(),
  })

  return schema
}
