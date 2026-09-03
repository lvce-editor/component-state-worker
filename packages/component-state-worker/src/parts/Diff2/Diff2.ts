import * as ComponentStateViewStates from '../ComponentStateViewStates/ComponentStateViewStates.ts'

export const diff2 = (uid: number): readonly number[] => {
  const { oldState, scheduledState } = ComponentStateViewStates.get(uid)
  return oldState.components === scheduledState.components && oldState.loaded === scheduledState.loaded ? [] : [1]
}
