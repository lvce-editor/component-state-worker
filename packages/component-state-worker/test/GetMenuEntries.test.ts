import { expect, test } from '@jest/globals'
import { getMenuEntries } from '../src/parts/GetMenuEntries/GetMenuEntries.ts'
import { getMenuEntryIds } from '../src/parts/GetMenuEntryIds/GetMenuEntryIds.ts'

test('offers Show Dom for the component passed by the card', () => {
  expect(getMenuEntryIds()).toEqual([34])
  expect(getMenuEntries(7, { componentUid: 0.25 })).toEqual([
    { args: [0.25], command: 'ComponentState.showDom', flags: 0, id: 'showDom', label: 'Show Dom' },
  ])
})

test('disables DOM inspection for components without a DOM API', () => {
  expect(getMenuEntries(7, { componentUid: 9, domAvailable: false })[0]).toEqual(expect.objectContaining({ flags: 5, label: 'Show Dom' }))
})
