import * as ComponentStateViewStates from '../ComponentStateViewStates/ComponentStateViewStates.ts'

export const diff2 = (uid: number): readonly number[] => {
  const { oldState, scheduledState } = ComponentStateViewStates.get(uid)
  const diff: number[] = []
  if (
    oldState.components !== scheduledState.components ||
    oldState.loaded !== scheduledState.loaded ||
    oldState.columnCount !== scheduledState.columnCount
  ) {
    diff.push(1)
  }
  if (oldState.dragUri !== scheduledState.dragUri) {
    diff.push(2)
  }
  return diff
}
