export const removeSchemaProperty = (state: Readonly<Record<string, unknown>>): Record<string, unknown> => {
  return Object.fromEntries(Object.entries(state).filter(([key]) => key !== '$schema'))
}
