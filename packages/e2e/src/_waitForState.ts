export const waitForState = async <T>(
  read: () => Promise<T>,
  matches: (value: T) => boolean,
  description: string,
  timeout = 5000,
): Promise<T> => {
  const deadline = performance.now() + timeout
  let value: T | undefined
  do {
    value = await read()
    if (matches(value)) {
      return value
    }
  } while (performance.now() < deadline)
  throw new Error(`Expected ${description}, last value: ${JSON.stringify(value)}`)
}
