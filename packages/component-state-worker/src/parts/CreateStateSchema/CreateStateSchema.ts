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
      // A snapshot cannot establish whether future numeric values are integers.
      return { type: 'number' }
    case 'object':
      return {
        // Components may add properties after this snapshot is taken.
        additionalProperties: true,
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
