import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.editable-component'

// Enable after the Component State panel and Explorer state API are integrated into LVCE Editor.
export const skip = 1

export const test: Test = async ({ Command, expect, Locator }) => {
  await Command.execute('Layout.showPanel', 'ComponentState')

  const explorerCard = Locator('.ComponentStateCard', { hasText: 'Explorer' })
  await expect(explorerCard).toHaveAttribute('disabled', null)
  await expect(explorerCard.locator('.ComponentStateCardStatus')).toHaveText('Open JSON state')
}
