import { RendererWorker } from '@lvce-editor/rpc-registry'

export const openUri = async (viewUid: number, uri: string): Promise<void> => {
  await RendererWorker.invoke('Application.executeForView', viewUid, 'Main.openUri', uri)
}
