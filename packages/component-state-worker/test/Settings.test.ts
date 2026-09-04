import { expect, test } from '@jest/globals'
import { readFile } from 'node:fs/promises'

test('contributes the unavailable components setting with a false default', async () => {
  const settingsUrl = new URL('../settings.json', import.meta.url)
  const settings = JSON.parse(await readFile(settingsUrl, 'utf8'))

  expect(settings).toContainEqual(
    expect.objectContaining({
      id: 'componentStateView.showUnavailableComponents',
      type: 'boolean',
      value: false,
    }),
  )
})
