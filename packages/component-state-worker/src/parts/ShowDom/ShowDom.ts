import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'
import * as LiveComponentDomUri from '../LiveComponentDomUri/LiveComponentDomUri.ts'

export const showDom = async (state: ComponentStateViewState, componentUid: number): Promise<ComponentStateViewState> => {
  const { uid: viewUid } = state
  await RendererWorker.invoke('Application.executeForView', viewUid, 'Main.openUri', LiveComponentDomUri.toUri(componentUid))
  return state
}
