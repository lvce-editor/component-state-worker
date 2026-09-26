import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'
import * as LiveComponentSavedStateUri from '../LiveComponentSavedStateUri/LiveComponentSavedStateUri.ts'
import * as OpenUri from '../OpenUri/OpenUri.ts'

export const showSavedState = async (state: ComponentStateViewState, componentUid: number): Promise<ComponentStateViewState> => {
  const { uid: viewUid } = state
  await OpenUri.openUri(viewUid, LiveComponentSavedStateUri.toUri(componentUid))
  return state
}
