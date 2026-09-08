import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'
import * as LiveComponentStateUri from '../LiveComponentStateUri/LiveComponentStateUri.ts'

export const handleClick = async (state: ComponentStateViewState, uid: string): Promise<ComponentStateViewState> => {
  const { uid: viewUid } = state
  await RendererWorker.invoke('Application.executeForView', viewUid, 'Main.openUri', LiveComponentStateUri.toUri(Number(uid)))
  return state
}
