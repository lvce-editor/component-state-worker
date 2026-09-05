import type { JsonSchema } from '../JsonSchema/JsonSchema.ts'
import * as CreateValueSchema from '../CreateValueSchema/CreateValueSchema.ts'

export const createStateSchema = (state: Readonly<Record<string, unknown>>, schemaUri: string): JsonSchema => {
  const stateSchema = CreateValueSchema.createValueSchema(state)
  return {
    $id: schemaUri,
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    ...stateSchema,
    properties: {
      $schema: { type: 'string' },
      ...stateSchema.properties,
    },
  }
}
