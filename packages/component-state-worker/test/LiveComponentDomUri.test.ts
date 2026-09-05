import { expect, test } from '@jest/globals'
import * as LiveComponentDomUri from '../src/parts/LiveComponentDomUri/LiveComponentDomUri.ts'

test('gets the uid from a live component state schema uri', () => {
  expect(LiveComponentDomUri.getUid('live-component-state:///dom/42.json')).toBe(42)
})

test('supports decimal component uids', () => {
  expect(LiveComponentDomUri.toUri(0.25)).toBe('live-component-state:///dom/0.25.json')
})

test('identifies schema uris', () => {
  expect(LiveComponentDomUri.is('live-component-state:///dom/42.json')).toBe(true)
  expect(LiveComponentDomUri.is('live-component-state:///42.json')).toBe(false)
})

test('rejects invalid schema uris', () => {
  expect(() => LiveComponentDomUri.getUid('live-component-state:///42.json')).toThrow('Invalid live component state URI')
})
