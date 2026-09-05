import * as ComponentStateViewStates from '../ComponentStateViewStates/ComponentStateViewStates.ts'
import { getColumnCount } from '../GetColumnCount/GetColumnCount.ts'

export const diff2 = (uid: number): readonly number[] => {
  const { oldState, scheduledState } = ComponentStateViewStates.get(uid)
  const diff: number[] = []
  if (
    oldState.components !== scheduledState.components ||
    oldState.loaded !== scheduledState.loaded ||
    getColumnCount(oldState.width) !== getColumnCount(scheduledState.width)
  ) {
    diff.push(1)
  }
  if (oldState.dragUri !== scheduledState.dragUri) {
    diff.push(2)
  }
  return diff
}
