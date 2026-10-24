import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'
import * as ComponentStateViewStates from '../ComponentStateViewStates/ComponentStateViewStates.ts'

export const setViewState = (uid: number, componentState: unknown): void => {
  if (!componentState || typeof componentState !== 'object' || Array.isArray(componentState)) {
    throw new TypeError('Component state must be an object')
  }
  const { uid: componentStateUid } = componentState as ComponentStateViewState
  if (componentStateUid !== uid) {
    throw new Error(`Component state uid must remain ${uid}`)
  }
  const { newState, oldState } = ComponentStateViewStates.get(uid)
  const updatedState = { ...newState, ...(componentState as ComponentStateViewState) }
  ComponentStateViewStates.set(uid, oldState, updatedState, updatedState)
}
