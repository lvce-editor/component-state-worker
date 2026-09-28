import { expect, test } from '@jest/globals'
import * as ComponentStateStrings from '../src/parts/ComponentStateStrings/ComponentStateStrings.ts'

test('provides the component state labels', () => {
  expect(ComponentStateStrings.liveComponentState()).toBe('Live Component State')
  expect(ComponentStateStrings.liveComponentStateActions()).toBe('Live Component State actions')
  expect(ComponentStateStrings.refresh()).toBe('Refresh')
  expect(ComponentStateStrings.openJsonState()).toBe('Open JSON state')
  expect(ComponentStateStrings.stateApiUnavailable()).toBe('State API unavailable')
  expect(ComponentStateStrings.loadingLiveComponents()).toBe('Loading live components…')
  expect(ComponentStateStrings.showDom()).toBe('Show Dom')
})

test.each([0, 1, 42])('interpolates component count and uid %i', (value) => {
  expect(ComponentStateStrings.liveComponents(value)).toBe(`${value} live components`)
  expect(ComponentStateStrings.uid(value)).toBe(`uid ${value}`)
})
