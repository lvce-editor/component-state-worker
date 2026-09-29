import { beforeEach, expect, jest, test } from '@jest/globals'
import type { ComponentStateViewState } from '../src/parts/ComponentStateViewState/ComponentStateViewState.ts'

jest.unstable_mockModule('../src/parts/OpenUri/OpenUri.ts', () => ({
  openUri: jest.fn(),
}))

const { openUri } = await import('../src/parts/OpenUri/OpenUri.ts')
const { handleClick } = await import('../src/parts/HandleClick/HandleClick.ts')

const state: ComponentStateViewState = {
  columnCount: 1,
  components: [
    { displayName: 'CSV Viewer', domAvailable: true, editable: false, moduleId: 'ExtensionView', savedStateAvailable: true, uid: 49 },
    { displayName: 'Explorer', domAvailable: true, editable: true, moduleId: 'Explorer', savedStateAvailable: true, uid: 7 },
    { displayName: 'Unsupported', domAvailable: false, editable: false, moduleId: 'Editor', uid: 8 },
  ],
  dragUri: '',
  height: 100,
  loaded: true,
  uid: 3,
  width: 100,
  x: 0,
  y: 0,
}

beforeEach(() => {
  jest.resetAllMocks()
})

test('opens saved component state when a saved-state-only card is clicked', async () => {
  await expect(handleClick(state, '49')).resolves.toBe(state)
  expect(openUri).toHaveBeenCalledWith(3, 'live-component-state:///saved/49.json')
})

test('opens live component state when an editable card is clicked', async () => {
  await expect(handleClick(state, '7')).resolves.toBe(state)
  expect(openUri).toHaveBeenCalledWith(3, 'live-component-state:///7.json')
})

test('does nothing when a component exposes neither state API', async () => {
  await expect(handleClick(state, '8')).resolves.toBe(state)
  expect(openUri).not.toHaveBeenCalled()
})
