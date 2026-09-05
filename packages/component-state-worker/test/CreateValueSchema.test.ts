import { expect, test } from '@jest/globals'
import * as CreateValueSchema from '../src/parts/CreateValueSchema/CreateValueSchema.ts'

test('describes null', () => {
  expect(CreateValueSchema.createValueSchema(null)).toEqual({ type: 'null' })
})

test.each([true, false])('describes boolean %j', (value) => {
  expect(CreateValueSchema.createValueSchema(value)).toEqual({ type: 'boolean' })
})

test.each([0, 1, -1, 1.5, -0.25, Number.MAX_SAFE_INTEGER])('describes number %j without restricting it to integers', (value) => {
  expect(CreateValueSchema.createValueSchema(value)).toEqual({ type: 'number' })
})

test.each(['', 'hello', '42', 'true', 'line one\nline two', '日本語'])('describes string %j without inferring its contents', (value) => {
  expect(CreateValueSchema.createValueSchema(value)).toEqual({ type: 'string' })
})

test.each([
  { value: [] },
  { value: [1, 2] },
  { value: ['hello'] },
  { value: [null, true, 1, 'hello'] },
  { value: [{ nested: { value: 1 } }] },
])('describes array $value without constraining its items', ({ value }) => {
  expect(CreateValueSchema.createValueSchema(value)).toEqual({ type: 'array' })
})

test.each([
  { label: 'undefined', value: undefined },
  { label: 'bigint', value: 1n },
  { label: 'symbol', value: Symbol('value') },
  { label: 'function', value: (): number => 1 },
])('leaves $label unconstrained', ({ value }) => {
  expect(CreateValueSchema.createValueSchema(value)).toEqual({})
})

test('allows new properties on an empty object', () => {
  expect(CreateValueSchema.createValueSchema({})).toEqual({ additionalProperties: true, properties: {}, type: 'object' })
})

test('describes mixed object properties', () => {
  expect(CreateValueSchema.createValueSchema({ count: 1, enabled: false, items: [1], label: '', nullable: null })).toEqual({
    additionalProperties: true,
    properties: {
      count: { type: 'number' },
      enabled: { type: 'boolean' },
      items: { type: 'array' },
      label: { type: 'string' },
      nullable: { type: 'null' },
    },
    type: 'object',
  })
})

test('recursively describes nested objects and allows new properties at every level', () => {
  expect(CreateValueSchema.createValueSchema({ outer: { inner: { label: 'hello' } } })).toEqual({
    additionalProperties: true,
    properties: {
      outer: {
        additionalProperties: true,
        properties: {
          inner: { additionalProperties: true, properties: { label: { type: 'string' } }, type: 'object' },
        },
        type: 'object',
      },
    },
    type: 'object',
  })
})

test('omits undefined properties at every level while retaining null', () => {
  expect(CreateValueSchema.createValueSchema({ nested: { nullable: null, omitted: undefined }, omitted: undefined })).toEqual({
    additionalProperties: true,
    properties: {
      nested: { additionalProperties: true, properties: { nullable: { type: 'null' } }, type: 'object' },
    },
    type: 'object',
  })
})

test('describes an object containing only undefined properties as an empty object', () => {
  expect(CreateValueSchema.createValueSchema({ omitted: undefined })).toEqual({
    additionalProperties: true,
    properties: {},
    type: 'object',
  })
})

test('keeps unsupported object property values unconstrained', () => {
  expect(CreateValueSchema.createValueSchema({ callback: () => 1, count: 1n, symbol: Symbol('value') })).toEqual({
    additionalProperties: true,
    properties: { callback: {}, count: {}, symbol: {} },
    type: 'object',
  })
})

test.each([{}, { 'live-component-state:///10.json': '/file-icons/json.svg' }, { first: '/first.svg', second: '/second.svg' }])(
  'describes fileIconCache %j as a string dictionary without fixing its keys',
  (value) => {
    expect(CreateValueSchema.createValueSchema(value, 'fileIconCache')).toEqual({
      additionalProperties: { type: 'string' },
      type: 'object',
    })
  },
)

test('recognizes fileIconCache inside nested objects', () => {
  expect(CreateValueSchema.createValueSchema({ nested: { fileIconCache: { file: '/file.svg' } } })).toEqual({
    additionalProperties: true,
    properties: {
      nested: {
        additionalProperties: true,
        properties: { fileIconCache: { additionalProperties: { type: 'string' }, type: 'object' } },
        type: 'object',
      },
    },
    type: 'object',
  })
})

test.each(['', 'icons', 'FileIconCache', 'fileIconCacheExtra'])('infers ordinary object properties for property name %j', (propertyName) => {
  expect(CreateValueSchema.createValueSchema({ file: '/file.svg' }, propertyName)).toEqual({
    additionalProperties: true,
    properties: { file: { type: 'string' } },
    type: 'object',
  })
})

test.each([
  { type: 'null', value: null },
  { type: 'array', value: [] },
  { type: 'string', value: '/file.svg' },
  { type: 'number', value: 1 },
  { type: 'boolean', value: false },
])('preserves $type values named fileIconCache', ({ type, value }) => {
  expect(CreateValueSchema.createValueSchema(value, 'fileIconCache')).toEqual({ type })
})

test('ignores inherited, non-enumerable, and symbol properties', () => {
  const value = Object.create({ inherited: 1 })
  Object.defineProperties(value, {
    hidden: { value: true },
    visible: { enumerable: true, value: 'hello' },
    [Symbol('symbol')]: { enumerable: true, value: 1 },
  })

  expect(CreateValueSchema.createValueSchema(value)).toEqual({
    additionalProperties: true,
    properties: { visible: { type: 'string' } },
    type: 'object',
  })
})

test('supports objects without a prototype', () => {
  const value = Object.create(null)
  Object.defineProperty(value, 'count', { enumerable: true, value: 1 })

  expect(CreateValueSchema.createValueSchema(value)).toEqual({
    additionalProperties: true,
    properties: { count: { type: 'number' } },
    type: 'object',
  })
})

test('preserves property names that overlap with Object.prototype', () => {
  const value = { ['__proto__']: 'value', constructor: 1, toString: false }

  expect(CreateValueSchema.createValueSchema(value)).toEqual({
    additionalProperties: true,
    properties: { ['__proto__']: { type: 'string' }, constructor: { type: 'number' }, toString: { type: 'boolean' } },
    type: 'object',
  })
})

test('handles shared nested objects independently', () => {
  const child = { label: 'hello' }
  const childSchema = { additionalProperties: true, properties: { label: { type: 'string' } }, type: 'object' }

  expect(CreateValueSchema.createValueSchema({ first: child, second: child })).toEqual({
    additionalProperties: true,
    properties: { first: childSchema, second: childSchema },
    type: 'object',
  })
})

test('does not mutate a frozen snapshot', () => {
  const nested = Object.freeze({ count: 1, omitted: undefined })
  const items = Object.freeze([1, 2])
  const value = Object.freeze({ items, nested })

  expect(CreateValueSchema.createValueSchema(value)).toEqual({
    additionalProperties: true,
    properties: {
      items: { type: 'array' },
      nested: { additionalProperties: true, properties: { count: { type: 'number' } }, type: 'object' },
    },
    type: 'object',
  })
  expect(value).toEqual({ items: [1, 2], nested: { count: 1, omitted: undefined } })
})
