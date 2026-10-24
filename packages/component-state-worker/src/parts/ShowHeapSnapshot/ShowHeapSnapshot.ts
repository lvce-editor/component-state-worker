import { MainProcess, RendererWorker } from '@lvce-editor/rpc-registry'
import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'

export const showHeapSnapshot = async (state: ComponentStateViewState, componentUid: number): Promise<ComponentStateViewState> => {
  const { components, uid: viewUid } = state
  if (components.every((component) => !(component.uid === componentUid && component.heapSnapshotAvailable))) {
    return state
  }
  const workerName = await RendererWorker.invoke('ComponentState.getWorkerName', componentUid)
  const windowId = await RendererWorker.getWindowId()
  const uri = await MainProcess.invoke('ElectronDeveloper.takeWorkerHeapSnapshot', windowId, workerName)
  await RendererWorker.invoke('Application.executeForView', viewUid, 'Main.openUri', uri)
  return state
}
