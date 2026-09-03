import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.basic'

// Enable after the Component State panel is integrated into LVCE Editor.
export const skip = 1

export const test: Test = async ({ Command, expect, Locator }) => {
  await Command.execute('Layout.showPanel', 'ComponentState')

  const view = Locator('.ComponentStateView')
  await expect(view).toBeVisible()
  await expect(view.locator('.ComponentStateHeading')).toHaveText('Live Component State')
  await expect(view.locator('.ComponentStateDescription')).toContainText('live components')
}
