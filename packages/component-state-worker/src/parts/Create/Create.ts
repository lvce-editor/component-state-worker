import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'
import * as ComponentStateViewStates from '../ComponentStateViewStates/ComponentStateViewStates.ts'
import { getColumnCount } from '../GetColumnCount/GetColumnCount.ts'

export const create = (uid: number, x: number, y: number, width: number, height: number): void => {
  const state: ComponentStateViewState = {
    columnCount: getColumnCount(width),
    components: [],
    dragUri: '',
    height,
    loaded: false,
    uid,
    width,
    x,
    y,
  }
  ComponentStateViewStates.set(uid, state, state)
}
