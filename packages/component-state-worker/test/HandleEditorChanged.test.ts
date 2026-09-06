import { beforeEach, expect, jest, test } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'

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

test('updates virtual DOM from editor content', async () => {
  const dom = [{ childCount: 0, className: 'Edited', type: VirtualDomElements.Div }]
  jest.mocked(EditorWorker.invoke).mockResolvedValue(JSON.stringify(dom))
  await handleEditorChanged(99, 'live-component-state:///dom/0.25.json')
  expect(RendererWorker.invoke).toHaveBeenCalledWith('ComponentState.setDom', 0.25, dom)
})

test.each(['[', '{}', 'null'])('ignores incomplete or non-array DOM JSON: %s', async (content) => {
  jest.mocked(EditorWorker.invoke).mockResolvedValue(content)
  await handleEditorChanged(99, 'live-component-state:///dom/7.json')
  expect(RendererWorker.invoke).not.toHaveBeenCalled()
})
