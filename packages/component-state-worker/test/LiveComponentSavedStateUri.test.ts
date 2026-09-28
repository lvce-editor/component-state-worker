import { expect, test } from '@jest/globals'
import * as LiveComponentSavedStateUri from '../src/parts/LiveComponentSavedStateUri/LiveComponentSavedStateUri.ts'

test('parses an integer saved-state uri', () => {
  expect(LiveComponentSavedStateUri.getUid('live-component-state:///saved/42.json')).toBe(42)
})

test('preserves a decimal component uid', () => {
  expect(LiveComponentSavedStateUri.toUri(0.25)).toBe('live-component-state:///saved/0.25.json')
  expect(LiveComponentSavedStateUri.getUid('live-component-state:///saved/0.25.json')).toBe(0.25)
})

test('recognizes only saved-state uris', () => {
  expect(LiveComponentSavedStateUri.is('live-component-state:///saved/42.json')).toBe(true)
  expect(LiveComponentSavedStateUri.is('live-component-state:///42.json')).toBe(false)
  expect(() => LiveComponentSavedStateUri.getUid('live-component-state:///42.json')).toThrow('Invalid live component state URI')
})
