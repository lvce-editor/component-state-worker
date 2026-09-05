import { expect, test } from '@jest/globals'
import * as CreateStateSchema from '../src/parts/CreateStateSchema/CreateStateSchema.ts'

test.each([{}, { 'live-component-state:///10.json': '/file-icons/json.svg' }])(
  'describes fileIconCache as a string dictionary: %j',
  (fileIconCache) => {
    const schema = CreateStateSchema.createStateSchema({ fileIconCache }, 'live-component-state:///schemas/2.json')

    expect(schema.properties?.fileIconCache).toEqual({
      additionalProperties: { type: 'string' },
      type: 'object',
    })
  },
)

test('infers JSON schema property types recursively', () => {
  expect(
    CreateStateSchema.createStateSchema(
      {
        array: [],
        boolean: true,
        float: 1.5,
        integer: 1,
        nested: { label: 'test' },
        nullable: null,
        omitted: undefined,
        string: 'test',
      },
      'live-component-state:///schemas/7.json',
    ),
  ).toEqual({
    $id: 'live-component-state:///schemas/7.json',
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    additionalProperties: true,
    properties: {
      $schema: { type: 'string' },
      array: { type: 'array' },
      boolean: { type: 'boolean' },
      float: { type: 'number' },
      integer: { type: 'number' },
      nested: {
        additionalProperties: true,
        properties: {
          label: { type: 'string' },
        },
        type: 'object',
      },
      nullable: { type: 'null' },
      string: { type: 'string' },
    },
    type: 'object',
  })
})

test('keeps snapshot schemas open to fractional values and properties added later', () => {
  const schema = CreateStateSchema.createStateSchema({ height: 652, stats: {} }, 'live-component-state:///schemas/8.json')

  expect(schema.properties?.height).toEqual({ type: 'number' })
  expect(schema.additionalProperties).toBe(true)
  expect(schema.properties?.stats.additionalProperties).toBe(true)
})
