import { expect, jest, test } from '@jest/globals'

jest.unstable_mockModule('@lvce-editor/rpc-registry', () => ({
  EditorWorker: {},
  MainProcess: {},
  RendererWorker: {
    initializeRendererWorkerForWorker: jest.fn<(commandMap: object) => Promise<void>>().mockResolvedValue(undefined),
  },
}))

const { RendererWorker } = await import('@lvce-editor/rpc-registry')
const { commandMap } = await import('../src/parts/CommandMap/CommandMap.ts')
const { initializeRendererWorker } = await import('../src/parts/InitializeRendererWorker/InitializeRendererWorker.ts')

test('connects the renderer worker using the component state commands', async () => {
  await initializeRendererWorker()
  expect(RendererWorker.initializeRendererWorkerForWorker).toHaveBeenCalledWith(commandMap)
})
