import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'
import * as LiveComponentStateUri from '../LiveComponentStateUri/LiveComponentStateUri.ts'
import * as OpenUri from '../OpenUri/OpenUri.ts'

export const handleClick = async (state: ComponentStateViewState, uid: string): Promise<ComponentStateViewState> => {
  const { uid: viewUid } = state
  await OpenUri.openUri(viewUid, LiveComponentStateUri.toUri(Number(uid)))
  return state
}
