import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.unavailable-run-and-debug'

export const test: Test = async ({ ComponentState, Developer, expect, Locator, Settings, SideBar }) => {
  await Settings.update({ 'componentStateView.showUnavailableComponents': true, 'editor.fontFamily': 'monospace' })
  await SideBar.open('Run And Debug')
  const view = Locator('.RunAndDebug')
  await expect(view).toBeVisible()
  await Developer.openComponentState()
  const components = await ComponentState.getComponents()
  const component = components.find((item) => item.moduleId === 'Run And Debug')
  if (!component || component.editable) {
    throw new Error(`Expected Run And Debug without a state API; add a live-edit test when supported: ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  await expect(card.locator('.ComponentStateCardTitle')).toHaveText('Run And Debug')
  await expect(card.locator('.ComponentStateCardStatus')).toHaveText('State API unavailable')
  await expect(card).toHaveAttribute('disabled', '')
}
