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

const mockEditor = (uri: string, content: string): void => {
  jest.mocked(EditorWorker.invoke).mockImplementation(async (method, editorUid) => {
    if (method === 'Editor.getKeys') {
      return ['41', '42']
    }
    if (method === 'Editor.getUri') {
      return editorUid === 42 ? uri : 'file:///other.json'
    }
    if (method === 'Editor.getText') {
      return content
    }
    throw new Error(`Unexpected method ${method}`)
  })
}

beforeEach(() => {
  jest.resetAllMocks()
})

test('updates a component from valid editor content', async () => {
  mockEditor('live-component-state:///7.json', '{"title":"Instant title","uid":7}')

  await handleEditorChanged(99, 'live-component-state:///7.json')

  expect(EditorWorker.invoke).toHaveBeenCalledTimes(4)
  expect(EditorWorker.invoke).toHaveBeenNthCalledWith(1, 'Editor.getKeys')
  expect(EditorWorker.invoke).toHaveBeenNthCalledWith(2, 'Editor.getUri', 41)
  expect(EditorWorker.invoke).toHaveBeenNthCalledWith(3, 'Editor.getUri', 42)
  expect(EditorWorker.invoke).toHaveBeenNthCalledWith(4, 'Editor.getText', 42)
  expect(RendererWorker.invoke).toHaveBeenCalledWith('ComponentState.setState', 7, { title: 'Instant title', uid: 7 })
})

test('ignores changes to regular files', async () => {
  await handleEditorChanged(99, 'file:///test.json')

  expect(EditorWorker.invoke).not.toHaveBeenCalled()
  expect(RendererWorker.invoke).not.toHaveBeenCalled()
})

test('ignores changes when the editor is no longer open', async () => {
  jest.mocked(EditorWorker.invoke).mockResolvedValue([])

  await handleEditorChanged(99, 'live-component-state:///7.json')

  expect(EditorWorker.invoke).toHaveBeenCalledWith('Editor.getKeys')
  expect(RendererWorker.invoke).not.toHaveBeenCalled()
})

test('ignores invalid json while editing', async () => {
  mockEditor('live-component-state:///7.json', '{"title":')

  await handleEditorChanged(99, 'live-component-state:///7.json')

  expect(RendererWorker.invoke).not.toHaveBeenCalled()
})

test('ignores valid non-object json', async () => {
  mockEditor('live-component-state:///7.json', '[]')

  await handleEditorChanged(99, 'live-component-state:///7.json')

  expect(RendererWorker.invoke).not.toHaveBeenCalled()
})
