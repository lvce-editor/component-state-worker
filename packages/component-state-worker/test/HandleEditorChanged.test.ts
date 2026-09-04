import { beforeEach, expect, jest, test } from '@jest/globals'

jest.unstable_mockModule('@lvce-editor/rpc-registry', () => ({
  EditorWorker: {
    invoke: jest.fn(),
  },
  RendererWorker: {
    invoke: jest.fn(),
  },
}))

const { EditorWorker, RendererWorker } = await import('@lvce-editor/rpc-registry')
const { handleEditorChanged } = await import('../src/parts/HandleEditorChanged/HandleEditorChanged.ts')

beforeEach(() => {
  jest.resetAllMocks()
})

test('updates a component from valid editor content', async () => {
  jest.mocked(EditorWorker.invoke).mockResolvedValue('{"$schema":"live-component-state:///schemas/7.json","title":"Instant title","uid":7}')

  await handleEditorChanged(99, 'live-component-state:///7.json')

  expect(EditorWorker.invoke).toHaveBeenCalledWith('Editor.getText', 99)
  expect(RendererWorker.invoke).toHaveBeenCalledWith('ComponentState.setState', 7, { title: 'Instant title', uid: 7 })
})

test('ignores changes to regular files', async () => {
  await handleEditorChanged(99, 'file:///test.json')

  expect(EditorWorker.invoke).not.toHaveBeenCalled()
  expect(RendererWorker.invoke).not.toHaveBeenCalled()
})

test('ignores invalid json while editing', async () => {
  jest.mocked(EditorWorker.invoke).mockResolvedValue('{"title":')

  await handleEditorChanged(99, 'live-component-state:///7.json')

  expect(RendererWorker.invoke).not.toHaveBeenCalled()
})

test('ignores valid non-object json', async () => {
  jest.mocked(EditorWorker.invoke).mockResolvedValue('[]')

  await handleEditorChanged(99, 'live-component-state:///7.json')

  expect(RendererWorker.invoke).not.toHaveBeenCalled()
})
