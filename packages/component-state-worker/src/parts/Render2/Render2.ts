import { ViewletCommand } from '@lvce-editor/constants'
import * as ComponentStateViewStates from '../ComponentStateViewStates/ComponentStateViewStates.ts'
import { getComponentStateVirtualDom } from '../GetComponentStateVirtualDom/GetComponentStateVirtualDom.ts'

export const render2 = (uid: number, diffResult: readonly number[]): readonly any[] => {
  const { newState } = ComponentStateViewStates.get(uid)
  ComponentStateViewStates.set(uid, newState, newState)
  if (diffResult.length === 0) {
    return []
  }
  return [[ViewletCommand.SetDom2, uid, getComponentStateVirtualDom(newState.components, newState.loaded)]]
}
