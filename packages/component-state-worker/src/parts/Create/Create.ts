import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'
import * as ComponentStateViewStates from '../ComponentStateViewStates/ComponentStateViewStates.ts'

export const create = (uid: number, x: number, y: number, width: number, height: number): void => {
  const state: ComponentStateViewState = {
    components: [],
    height,
    loaded: false,
    uid,
    width,
    x,
    y,
  }
  ComponentStateViewStates.set(uid, state, state)
}
