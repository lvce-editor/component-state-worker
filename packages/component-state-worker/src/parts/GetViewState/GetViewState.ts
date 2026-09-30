import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'
import * as ComponentStateViewStates from '../ComponentStateViewStates/ComponentStateViewStates.ts'

export const getViewState = (uid: number): ComponentStateViewState => {
  return ComponentStateViewStates.get(uid).newState
}
