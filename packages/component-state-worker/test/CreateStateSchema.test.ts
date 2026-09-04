import { expect, test } from '@jest/globals'
import * as CreateStateSchema from '../src/parts/CreateStateSchema/CreateStateSchema.ts'

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
    additionalProperties: false,
    properties: {
      $schema: { type: 'string' },
      array: { type: 'array' },
      boolean: { type: 'boolean' },
      float: { type: 'number' },
      integer: { type: 'integer' },
      nested: {
        additionalProperties: false,
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
