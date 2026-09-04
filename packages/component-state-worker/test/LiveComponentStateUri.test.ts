import { expect, test } from '@jest/globals'
import { InvalidLiveComponentStateUriError } from '../src/parts/InvalidLiveComponentStateUriError/InvalidLiveComponentStateUriError.ts'
import * as LiveComponentStateUri from '../src/parts/LiveComponentStateUri/LiveComponentStateUri.ts'

test('gets the uid from a live component state uri', () => {
  expect(LiveComponentStateUri.getUid('live-component-state:///42.json')).toBe(42)
})

test('gets a decimal uid from a live component state uri', () => {
  expect(LiveComponentStateUri.getUid('live-component-state:///0.15499910092727165.json')).toBeCloseTo(0.15499910092727165)
})

test('throws an error with a code for an invalid uri', () => {
  expect(() => LiveComponentStateUri.getUid('file:///42.json')).toThrow(
    expect.objectContaining({
      code: 'E_INVALID_LIVE_COMPONENT_STATE_URI',
      message: 'Invalid live component state URI: file:///42.json',
      name: 'InvalidLiveComponentStateUriError',
    }),
  )
  expect(() => LiveComponentStateUri.getUid('file:///42.json')).toThrow(InvalidLiveComponentStateUriError)
})

test('creates a live component state uri', () => {
  expect(LiveComponentStateUri.toUri(42)).toBe('live-component-state:///42.json')
})
