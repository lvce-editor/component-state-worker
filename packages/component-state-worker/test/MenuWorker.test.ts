import { expect, jest, test } from '@jest/globals'

const invoke = jest.fn()

jest.unstable_mockModule('@lvce-editor/rpc', () => ({
  LazyTransferMessagePortRpcParent: {
    create: jest.fn(async () => ({ invoke })),
  },
}))

jest.unstable_mockModule('@lvce-editor/rpc-registry', () => ({
  RendererWorker: {
    invokeAndTransfer: jest.fn(),
  },
}))

const { LazyTransferMessagePortRpcParent } = await import('@lvce-editor/rpc')
const { RendererWorker } = await import('@lvce-editor/rpc-registry')
const MenuWorker = await import('../src/parts/MenuWorker/MenuWorker.ts')

test('sends the message port to the menu worker', async () => {
  const [[{ send }]] = jest.mocked(LazyTransferMessagePortRpcParent.create).mock.calls
  const port = {} as MessagePort

  await send(port)

  expect(RendererWorker.invokeAndTransfer).toHaveBeenCalledWith('SendMessagePortToExtensionHostWorker.sendMessagePortToMenuWorker', port)
})

test('shows a menu', async () => {
  await MenuWorker.show2(7, 34, 120, 240, { componentUid: 0.25 })

  expect(invoke).toHaveBeenCalledWith('Menu.show2', 7, 34, 120, 240, { componentUid: 0.25 })
})
