import { beforeEach, expect, jest, test } from '@jest/globals'

jest.unstable_mockModule('@lvce-editor/rpc-registry', () => ({
  RendererWorker: {
    invoke: jest.fn(),
  },
}))

const { RendererWorker } = await import('@lvce-editor/rpc-registry')
const { handleEditorChanged } = await import('../src/parts/HandleEditorChanged/HandleEditorChanged.ts')

beforeEach(() => {
  jest.resetAllMocks()
})

test('updates a component from valid editor content', async () => {
  jest.mocked(RendererWorker.invoke).mockResolvedValueOnce({
    text: '{"title":"Instant title","uid":7}',
    uri: 'live-component-state:///7.json',
  })

  await handleEditorChanged(42, 'live-component-state:///7.json')

  expect(RendererWorker.invoke).toHaveBeenNthCalledWith(1, 'GetActiveEditor.getTextDocument')
  expect(RendererWorker.invoke).toHaveBeenNthCalledWith(2, 'ComponentState.setState', 7, { title: 'Instant title', uid: 7 })
})

test('ignores changes to regular files', async () => {
  await handleEditorChanged(42, 'file:///test.json')

  expect(RendererWorker.invoke).not.toHaveBeenCalled()
})

test('ignores changes when a different editor is active', async () => {
  jest.mocked(RendererWorker.invoke).mockResolvedValue({ text: '{}', uri: 'file:///other.json' })

  await handleEditorChanged(42, 'live-component-state:///7.json')

  expect(RendererWorker.invoke).toHaveBeenCalledTimes(1)
})

test('ignores changes when no editor is active', async () => {
  jest.mocked(RendererWorker.invoke).mockResolvedValue(undefined)

  await handleEditorChanged(42, 'live-component-state:///7.json')

  expect(RendererWorker.invoke).toHaveBeenCalledTimes(1)
})

test('ignores invalid json while editing', async () => {
  jest.mocked(RendererWorker.invoke).mockResolvedValue({ text: '{"title":', uri: 'live-component-state:///7.json' })

  await handleEditorChanged(42, 'live-component-state:///7.json')

  expect(RendererWorker.invoke).toHaveBeenCalledTimes(1)
})

test('ignores valid non-object json', async () => {
  jest.mocked(RendererWorker.invoke).mockResolvedValue({ text: '[]', uri: 'live-component-state:///7.json' })

  await handleEditorChanged(42, 'live-component-state:///7.json')

  expect(RendererWorker.invoke).toHaveBeenCalledTimes(1)
})
