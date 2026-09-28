import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'
import * as LiveComponentStateUri from '../LiveComponentStateUri/LiveComponentStateUri.ts'
import * as OpenUri from '../OpenUri/OpenUri.ts'

export const handleClick = async (state: ComponentStateViewState, uid: string): Promise<ComponentStateViewState> => {
  const { components, uid: viewUid } = state
  const component = components.find((item) => item.uid === Number(uid) && item.editable)
  if (!component) {
    return state
  }
  await OpenUri.openUri(viewUid, LiveComponentStateUri.toUri(component.uid))
  return state
}
