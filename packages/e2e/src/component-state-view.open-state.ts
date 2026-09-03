import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.open-state'

// Enable after the Component State panel and Explorer state API are integrated into LVCE Editor.
export const skip = 1

export const test: Test = async ({ Command, Editor, expect, Locator }) => {
  await Command.execute('Layout.showPanel', 'ComponentState')

  const explorerCard = Locator('.ComponentStateCard', { hasText: 'Explorer' })
  // eslint-disable-next-line e2e/no-direct-click -- verifies that a rendered component card opens its live JSON state
  await explorerCard.click()

  const editor = Locator('.Editor')
  await expect(editor).toBeVisible()
  const content = await Editor.getText()
  // @ts-ignore the e2e expect implementation supports scalar matchers at runtime
  expect(content).toContain('"uid"')
}
