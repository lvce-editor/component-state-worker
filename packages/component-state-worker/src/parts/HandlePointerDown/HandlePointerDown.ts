import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'
import * as LiveComponentStateUri from '../LiveComponentStateUri/LiveComponentStateUri.ts'

export const handlePointerDown = (state: ComponentStateViewState, button: number, uid: string): ComponentStateViewState => {
  if (button !== 0) {
    return state
  }
  const { components } = state
  const component = components.find((item) => item.uid === Number(uid) && item.editable)
  return {
    ...state,
    dragUri: component ? LiveComponentStateUri.toUri(component.uid) : '',
  }
}
