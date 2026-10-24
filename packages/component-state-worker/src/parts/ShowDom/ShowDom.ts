import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'
import * as LiveComponentDomUri from '../LiveComponentDomUri/LiveComponentDomUri.ts'
import * as OpenUri from '../OpenUri/OpenUri.ts'

export const showDom = async (state: ComponentStateViewState, componentUid: number): Promise<ComponentStateViewState> => {
  const { uid: viewUid } = state
  await OpenUri.openUri(viewUid, LiveComponentDomUri.toUri(componentUid))
  return state
}
