import { expect, test } from '@jest/globals'
import { getMenuEntries } from '../src/parts/GetMenuEntries/GetMenuEntries.ts'
import { getMenuEntryIds } from '../src/parts/GetMenuEntryIds/GetMenuEntryIds.ts'

test('offers Show Dom for the component passed by the card', () => {
  expect(getMenuEntryIds()).toEqual([34])
  expect(getMenuEntries(7, { componentUid: 0.25 })).toEqual([
    { args: [0.25], command: 'ComponentState.showDom', flags: 0, id: 'showDom', label: 'Show Dom' },
    { args: [0.25], command: 'ComponentState.showHeapSnapshot', flags: 5, id: 'showHeapSnapshot', label: 'Show Heap Snapshot' },
  ])
})

test('disables DOM inspection for components without a DOM API', () => {
  expect(getMenuEntries(7, { componentUid: 9, domAvailable: false })[0]).toEqual(expect.objectContaining({ flags: 5, label: 'Show Dom' }))
})

test('enables heap snapshots when Electron provides worker inspection', () => {
  expect(getMenuEntries(7, { componentUid: 9, heapSnapshotAvailable: true })[1]).toEqual(expect.objectContaining({ args: [9], flags: 0 }))
})
