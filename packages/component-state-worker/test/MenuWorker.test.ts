import { expect, jest, test } from '@jest/globals'

const invoke = jest.fn()
const create = jest.fn<(...args: readonly any[]) => Promise<any>>().mockResolvedValue({ invoke })
jest.unstable_mockModule('@lvce-editor/rpc', () => ({
  LazyTransferMessagePortRpcParent: { create },
}))
jest.unstable_mockModule('@lvce-editor/rpc-registry', () => ({
  RendererWorker: { invokeAndTransfer: jest.fn() },
}))

const { RendererWorker } = await import('@lvce-editor/rpc-registry')
const MenuWorker = await import('../src/parts/MenuWorker/MenuWorker.ts')

test('connects to the menu worker and preserves the view and component context', async () => {
  const { send } = create.mock.calls[0][0]
  const port = {}
  await send(port)
  expect(RendererWorker.invokeAndTransfer).toHaveBeenCalledWith('SendMessagePortToExtensionHostWorker.sendMessagePortToMenuWorker', port)
  const args = { componentUid: 0.25, domAvailable: false }
  await MenuWorker.show2(7, 34, 120, 240, args)
  expect(invoke).toHaveBeenCalledWith('Menu.show2', 7, 34, 120, 240, args)
})
