import { LazyTransferMessagePortRpcParent } from '@lvce-editor/rpc'
import { RendererWorker } from '@lvce-editor/rpc-registry'

const send = async (port: MessagePort): Promise<void> => {
  await RendererWorker.invokeAndTransfer('SendMessagePortToExtensionHostWorker.sendMessagePortToMenuWorker', port)
}

const rpc = await LazyTransferMessagePortRpcParent.create({ commandMap: {}, send })

export const show2 = async (uid: number, menuId: number, x: number, y: number, args: unknown): Promise<void> => {
  await rpc.invoke('Menu.show2', uid, menuId, x, y, args)
}
