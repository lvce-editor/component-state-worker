import { expect, test } from '@jest/globals'
import * as LiveComponentStateSchemaUri from '../src/parts/LiveComponentStateSchemaUri/LiveComponentStateSchemaUri.ts'

test('gets the uid from a live component state schema uri', () => {
  expect(LiveComponentStateSchemaUri.getUid('live-component-state:///schemas/42.json')).toBe(42)
})

test('supports decimal component uids', () => {
  expect(LiveComponentStateSchemaUri.toUri(0.25)).toBe('live-component-state:///schemas/0.25.json')
})

test('identifies schema uris', () => {
  expect(LiveComponentStateSchemaUri.is('live-component-state:///schemas/42.json')).toBe(true)
  expect(LiveComponentStateSchemaUri.is('live-component-state:///42.json')).toBe(false)
})

test('rejects invalid schema uris', () => {
  expect(() => LiveComponentStateSchemaUri.getUid('live-component-state:///42.json')).toThrow('Invalid live component state URI')
})
