interface JsonSchema {
  readonly $id?: string
  readonly $schema?: string
  readonly additionalProperties?: boolean
  readonly properties?: Readonly<Record<string, JsonSchema>>
  readonly type?: string
}

const createValueSchema = (value: unknown): JsonSchema => {
  if (value === null) {
    return { type: 'null' }
  }
  if (Array.isArray(value)) {
    return { type: 'array' }
  }
  switch (typeof value) {
    case 'boolean':
      return { type: 'boolean' }
    case 'number':
      return { type: Number.isSafeInteger(value) ? 'integer' : 'number' }
    case 'object':
      return {
        additionalProperties: false,
        properties: Object.fromEntries(
          Object.entries(value)
            .filter((entry) => entry[1] !== undefined)
            .map(([key, child]) => [key, createValueSchema(child)]),
        ),
        type: 'object',
      }
    case 'string':
      return { type: 'string' }
    default:
      return {}
  }
}

export const createStateSchema = (state: Readonly<Record<string, unknown>>, schemaUri: string): JsonSchema => {
  const stateSchema = createValueSchema(state)
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
