import { expect, jest, test } from '@jest/globals'

jest.unstable_mockModule('@lvce-editor/rpc-registry', () => ({
  EditorWorker: {},
  RendererWorker: {
    initializeEditorWorker: jest.fn<(sourceId: number) => Promise<void>>().mockResolvedValue(undefined),
  },
}))

const { RendererWorker } = await import('@lvce-editor/rpc-registry')
const { initializeEditorWorker } = await import('../src/parts/InitializeEditorWorker/InitializeEditorWorker.ts')

test('connects the component state worker to the editor worker', async () => {
  await initializeEditorWorker()
  expect(RendererWorker.initializeEditorWorker).toHaveBeenCalledWith(9113)
})
