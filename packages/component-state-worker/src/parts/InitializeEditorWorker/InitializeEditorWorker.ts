import { RendererWorker } from '@lvce-editor/rpc-registry'
import * as EditorChangeListener from '../EditorChangeListener/EditorChangeListener.ts'

export const initializeEditorWorker = async (): Promise<void> => {
  await RendererWorker.initializeEditorWorker(EditorChangeListener.rpcId)
}
