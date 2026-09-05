import { beforeEach, expect, jest, test } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'

jest.unstable_mockModule('@lvce-editor/rpc-registry', () => ({
  EditorWorker: {
    invoke: jest.fn(),
  },
  RendererWorker: {
    getComponents: jest.fn(),
    invoke: jest.fn(),
  },
}))

const { EditorWorker, RendererWorker } = await import('@lvce-editor/rpc-registry')
const FileSystem = await import('../src/parts/FileSystem/FileSystem.ts')

beforeEach(() => {
  jest.resetAllMocks()
})

test('reads formatted component state', async () => {
  jest.mocked(RendererWorker.invoke).mockResolvedValue({ focusedIndex: 2, uid: 7 })

  await expect(FileSystem.readFile('live-component-state:///7.json')).resolves.toBe(
    '{\n  "$schema": "live-component-state:///schemas/7.json",\n  "focusedIndex": 2,\n  "uid": 7\n}\n',
  )
  expect(EditorWorker.invoke).toHaveBeenCalledWith('Listener.register', 1, 9113)
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
    additionalProperties: true,
    properties: {
      $schema: { type: 'string' },
      focused: { type: 'boolean' },
      focusedIndex: { type: 'number' },
      labels: { type: 'array' },
      uid: { type: 'number' },
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

test('reads formatted virtual DOM without registering a state editor listener', async () => {
  const dom = [{ childCount: 0, className: 'Explorer', type: VirtualDomElements.Div }]
  jest.mocked(RendererWorker.invoke).mockResolvedValue(dom)
  await expect(FileSystem.readFile('live-component-state:///dom/0.25.json')).resolves.toBe(`${JSON.stringify(dom, null, 2)}\n`)
  expect(RendererWorker.invoke).toHaveBeenCalledWith('ComponentState.getDom', 0.25)
  expect(EditorWorker.invoke).not.toHaveBeenCalled()
})

test('treats DOM files as read-only and checks the component exists', async () => {
  jest.mocked(RendererWorker.getComponents).mockResolvedValue([{ editable: true, moduleId: 'Explorer', uid: 7 }])
  expect(FileSystem.isReadonly('live-component-state:///dom/7.json')).toBe(true)
  await expect(FileSystem.exists('live-component-state:///dom/7.json')).resolves.toBe(true)
  await expect(FileSystem.exists('live-component-state:///dom/8.json')).resolves.toBe(false)
  await expect(FileSystem.writeFile('live-component-state:///dom/7.json', '[]')).rejects.toThrow('Invalid live component state URI')
  expect(RendererWorker.invoke).not.toHaveBeenCalled()
})
