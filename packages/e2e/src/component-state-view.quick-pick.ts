import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.quick-pick'

export const test: Test = async ({ expect, Locator, QuickPick }) => {
  await QuickPick.open()
  await QuickPick.setValue('>Developer: Open Component State')

  const command = Locator('.QuickPickItem', { hasText: 'Developer: Open Component State' })
  await expect(command).toBeVisible()
  await QuickPick.selectItem('Developer: Open Component State')

  const view = Locator('.ComponentStateView')
  await expect(view).toBeVisible()
  await expect(view.locator('.ComponentStateHeading')).toHaveText('Live Component State')
}
