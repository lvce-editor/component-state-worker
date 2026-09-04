import { beforeEach, expect, jest, test } from '@jest/globals'

jest.unstable_mockModule('@lvce-editor/rpc-registry', () => ({
  RendererWorker: {
    getComponents: jest.fn(),
    invoke: jest.fn(),
  },
}))

const { RendererWorker } = await import('@lvce-editor/rpc-registry')
const FileSystem = await import('../src/parts/FileSystem/FileSystem.ts')

beforeEach(() => {
  jest.resetAllMocks()
})

test('reads formatted component state', async () => {
  jest.mocked(RendererWorker.invoke).mockResolvedValue({ focusedIndex: 2, uid: 7 })

  await expect(FileSystem.readFile('live-component-state:///7.json')).resolves.toBe(
    '{\n  "$schema": "live-component-state:///schemas/7.json",\n  "focusedIndex": 2,\n  "uid": 7\n}\n',
  )
  expect(RendererWorker.invoke).toHaveBeenCalledWith('ComponentState.getState', 7)
})

test('replaces component schema metadata with the live schema uri', async () => {
  jest.mocked(RendererWorker.invoke).mockResolvedValue({ $schema: 'old', focusedIndex: 2, uid: 7 })

  await expect(FileSystem.readFile('live-component-state:///7.json')).resolves.toContain(
    '"$schema": "live-component-state:///schemas/7.json"',
  )
})

test('creates a schema for component state on demand', async () => {
  jest.mocked(RendererWorker.invoke).mockResolvedValue({ focused: true, focusedIndex: 2, labels: [], uid: 7 })

  const content = await FileSystem.readFile('live-component-state:///schemas/7.json')

  expect(JSON.parse(content)).toEqual({
    $id: 'live-component-state:///schemas/7.json',
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    additionalProperties: false,
    properties: {
      $schema: { type: 'string' },
      focused: { type: 'boolean' },
      focusedIndex: { type: 'integer' },
      labels: { type: 'array' },
      uid: { type: 'integer' },
    },
    type: 'object',
  })
  expect(RendererWorker.invoke).toHaveBeenCalledWith('ComponentState.getState', 7)
})

test('writes parsed component state', async () => {
  jest.mocked(RendererWorker.invoke).mockResolvedValue(undefined)

  await FileSystem.writeFile('live-component-state:///7.json', '{"uid":7,"focusedIndex":3}')

  expect(RendererWorker.invoke).toHaveBeenCalledWith('ComponentState.setState', 7, { focusedIndex: 3, uid: 7 })
})

test('does not write schema metadata into component state', async () => {
  jest.mocked(RendererWorker.invoke).mockResolvedValue(undefined)

  await FileSystem.writeFile(
    'live-component-state:///7.json',
    '{"$schema":"live-component-state:///schemas/7.json","uid":7,"focusedIndex":3}',
  )

  expect(RendererWorker.invoke).toHaveBeenCalledWith('ComponentState.setState', 7, { focusedIndex: 3, uid: 7 })
})

test('rejects non-object JSON state', async () => {
  await expect(FileSystem.writeFile('live-component-state:///7.json', '[]')).rejects.toThrow('expected value to be of type object')
})

test('rejects invalid component state uris', async () => {
  await expect(FileSystem.readFile('file:///7.json')).rejects.toThrow('Invalid live component state URI')
})

test('lists only editable live components', async () => {
  jest.mocked(RendererWorker.getComponents).mockResolvedValue([
    { editable: true, moduleId: 'Explorer', uid: 7 },
    { editable: false, moduleId: 'Editor', uid: 8 },
  ])

  await expect(FileSystem.readDirWithFileTypes()).resolves.toEqual([{ name: '7.json', type: 7 }])
})

test('checks whether an editable component exists', async () => {
  jest.mocked(RendererWorker.getComponents).mockResolvedValue([
    { editable: true, moduleId: 'Explorer', uid: 7 },
    { editable: false, moduleId: 'Editor', uid: 8 },
  ])

  await expect(FileSystem.exists('live-component-state:///7.json')).resolves.toBe(true)
  await expect(FileSystem.exists('live-component-state:///schemas/7.json')).resolves.toBe(true)
  await expect(FileSystem.exists('live-component-state:///8.json')).resolves.toBe(false)
  expect(FileSystem.isReadonly()).toBe(false)
  expect(FileSystem.isReadonly('live-component-state:///schemas/7.json')).toBe(true)
  expect(FileSystem.canBeRestored).toBe(true)
})
