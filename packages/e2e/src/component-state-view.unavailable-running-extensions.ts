import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.unavailable-running-extensions'

export const test: Test = async ({ ComponentState, Developer, expect, Locator, RunningExtensions, Settings }) => {
  await Settings.update({ 'componentStateView.showUnavailableComponents': true, 'editor.fontFamily': 'monospace' })
  await RunningExtensions.show()
  const view = Locator('.RunningExtensions')
  await expect(view).toBeVisible()
  await Developer.openComponentState()
  const components = await ComponentState.getComponents()
  const component = components.find((item) => item.moduleId === 'RunningExtensions')
  if (!component || component.editable) {
    throw new Error(`Expected RunningExtensions without a state API; add a live-edit test when supported: ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  await expect(card.locator('.ComponentStateCardTitle')).toHaveText('RunningExtensions')
  await expect(card.locator('.ComponentStateCardStatus')).toHaveText('State API unavailable')
  await expect(card).toHaveAttribute('disabled', '')
}
