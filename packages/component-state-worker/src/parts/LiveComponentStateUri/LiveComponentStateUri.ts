const pattern = /^live-component-state:\/\/\/(\d+)\.json$/

export const getUid = (uri: string): number => {
  const match = pattern.exec(uri)
  if (!match) {
    throw new Error(`Invalid live component state URI: ${uri}`)
  }
  return Number(match[1])
}

export const toUri = (uid: number): string => `live-component-state:///${uid}.json`
