import { expect, jest, test } from '@jest/globals'

const rpc = {
  dispose: jest.fn(),
  invoke: jest.fn(),
  invokeAndTransfer: jest.fn(),
  send: jest.fn(),
}
const state: { send: ((port: MessagePort) => Promise<void>) | undefined } = { send: undefined }
const create = jest.fn(async (options: any) => {
  state.send = options.send
  return rpc
})

jest.unstable_mockModule('@lvce-editor/rpc', () => ({
  LazyTransferMessagePortRpcParent: {
    create,
  },
}))

jest.unstable_mockModule('@lvce-editor/rpc-registry', () => ({
  EditorWorker: {
    set: jest.fn(),
  },
  RendererWorker: {
    sendMessagePortToEditorWorker: jest.fn(),
  },
}))

const { EditorWorker, RendererWorker } = await import('@lvce-editor/rpc-registry')
const { initializeEditorWorker } = await import('../src/parts/InitializeEditorWorker/InitializeEditorWorker.ts')

test('connects the component state worker to the editor worker', async () => {
  await initializeEditorWorker()

  expect(create).toHaveBeenCalledWith({ commandMap: {}, send: expect.any(Function) })
  expect(EditorWorker.set).toHaveBeenCalledWith(rpc)
  const port = {} as MessagePort
  const { send } = state
  await send?.(port)
  expect(RendererWorker.sendMessagePortToEditorWorker).toHaveBeenCalledWith(port, 9113)
})
