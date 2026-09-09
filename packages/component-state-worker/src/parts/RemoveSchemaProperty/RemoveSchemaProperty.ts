const isNotSchema = (entry: any): boolean => {
  return key !== '$schema'
}

export const removeSchemaProperty = (state: Readonly<Record<string, unknown>>): Record<string, unknown> => {
  return Object.fromEntries(Object.entries(state).filter(isNotSchema))
}
