import { expect, test } from '@jest/globals'
import { getMenuEntries } from '../src/parts/GetMenuEntries/GetMenuEntries.ts'
import { getMenuEntryIds } from '../src/parts/GetMenuEntryIds/GetMenuEntryIds.ts'

test('offers Show Dom for the component passed by the card', () => {
  expect(getMenuEntryIds()).toEqual([34])
  expect(getMenuEntries(7, { componentUid: 0.25 })).toEqual([
    { args: [0.25], command: 'ComponentState.showSavedState', flags: 5, id: 'showSavedState', label: 'Show Saved State' },
    { args: [0.25], command: 'ComponentState.showDom', flags: 0, id: 'showDom', label: 'Show Dom' },
    { args: [0.25], command: 'ComponentState.showHeapSnapshot', flags: 5, id: 'showHeapSnapshot', label: 'Show Heap Snapshot' },
  ])
})

test('disables DOM inspection for components without a DOM API', () => {
  expect(getMenuEntries(7, { componentUid: 9, domAvailable: false })[1]).toEqual(expect.objectContaining({ flags: 5, label: 'Show Dom' }))
})

test('enables heap snapshots when Electron provides worker inspection', () => {
  expect(getMenuEntries(7, { componentUid: 9, heapSnapshotAvailable: true })[2]).toEqual(expect.objectContaining({ args: [9], flags: 0 }))
})

test('enables saved-state inspection only when the component exposes saveState', () => {
  expect(getMenuEntries(7, { componentUid: 9, savedStateAvailable: true })[0]).toEqual(
    expect.objectContaining({ args: [9], flags: 0, label: 'Show Saved State' }),
  )
})
