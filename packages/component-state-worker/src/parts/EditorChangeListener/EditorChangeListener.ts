import { EditorWorker } from '@lvce-editor/rpc-registry'

const editorChange = 1
export const rpcId = 9113

export const register = async (): Promise<void> => {
  await EditorWorker.invoke('Listener.register', editorChange, rpcId)
}
