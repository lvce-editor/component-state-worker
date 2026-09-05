export interface JsonSchema {
  readonly $id?: string
  readonly $schema?: string
  readonly additionalProperties?: boolean | JsonSchema
  readonly properties?: Readonly<Record<string, JsonSchema>>
  readonly type?: string
}
