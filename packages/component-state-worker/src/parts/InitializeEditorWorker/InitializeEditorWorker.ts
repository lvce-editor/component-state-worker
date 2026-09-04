import { LazyTransferMessagePortRpcParent } from '@lvce-editor/rpc'
import { EditorWorker, RendererWorker } from '@lvce-editor/rpc-registry'
import * as EditorChangeListener from '../EditorChangeListener/EditorChangeListener.ts'

export const initializeEditorWorker = async (): Promise<void> => {
  const rpc = await LazyTransferMessagePortRpcParent.create({
    commandMap: {},
    send: (port: MessagePort) => RendererWorker.sendMessagePortToEditorWorker(port, EditorChangeListener.rpcId),
  })
  EditorWorker.set(rpc)
}
