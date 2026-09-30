import { beforeEach, expect, test } from '@jest/globals'
import * as ComponentStateViewStates from '../src/parts/ComponentStateViewStates/ComponentStateViewStates.ts'
import { getViewState } from '../src/parts/GetViewState/GetViewState.ts'
import { setViewState } from '../src/parts/SetViewState/SetViewState.ts'

beforeEach(() => {
  ComponentStateViewStates.dispose(7)
  ComponentStateViewStates.dispose(8)
})

test('gets the current inspector state for its own uid', () => {
  const state = { columnCount: 2, components: [], dragUri: '', height: 400, loaded: true, uid: 7, width: 500, x: 0, y: 0 }
  ComponentStateViewStates.set(7, state, state)

  expect(getViewState(7)).toBe(state)
})

test('updates its own inspector state while preserving the previous state for rendering', () => {
  const oldState = { columnCount: 1, components: [], dragUri: '', height: 400, loaded: true, uid: 7, width: 300, x: 0, y: 0 }
  const newState = { ...oldState, columnCount: 2, width: 500 }
  ComponentStateViewStates.set(7, oldState, oldState)

  setViewState(7, newState)

  expect(ComponentStateViewStates.get(7)).toEqual({ newState, oldState, scheduledState: newState })
})

const invalidStates: readonly (readonly [unknown, string])[] = [
  [null, 'Component state must be an object'],
  [[], 'Component state must be an object'],
  [{ uid: 8 }, 'Component state uid must remain 7'],
]

test.each(invalidStates)('rejects invalid state updates %p', (newState, message) => {
  const state = { columnCount: 1, components: [], dragUri: '', height: 400, loaded: true, uid: 7, width: 300, x: 0, y: 0 }
  ComponentStateViewStates.set(7, state, state)

  expect(() => setViewState(7, newState)).toThrow(message)
  expect(ComponentStateViewStates.get(7).newState).toBe(state)
})
