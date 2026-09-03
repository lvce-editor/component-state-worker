import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.cards'

// Enable after the Component State panel is integrated into LVCE Editor.
export const skip = 1

export const test: Test = async ({ Command, expect, Locator }) => {
  await Command.execute('Layout.showPanel', 'ComponentState')

  const card = Locator('.ComponentStateCard').first()
  await expect(card).toBeVisible()
  await expect(card.locator('.ComponentStateCardTitle')).toBeVisible()
  await expect(card.locator('.ComponentStateCardUid')).toContainText('uid ')
  await expect(card.locator('.ComponentStateCardStatus')).toBeVisible()
}
