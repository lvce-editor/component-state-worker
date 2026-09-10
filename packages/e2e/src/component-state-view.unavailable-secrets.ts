import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.unavailable-secrets'

export const test: Test = async ({ ComponentState, Developer, expect, Locator, SecretsView, Settings }) => {
  await Settings.update({ 'componentStateView.showUnavailableComponents': true, 'editor.fontFamily': 'monospace' })
  await SecretsView.show()
  const view = Locator('.SecretsView')
  await expect(view).toBeVisible()
  await Developer.openComponentState()
  const components = await ComponentState.getComponents()
  const component = components.find((item) => item.moduleId === 'Secrets')
  if (!component || component.editable) {
    throw new Error(`Expected Secrets without a state API; add a live-edit test when supported: ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  await expect(card.locator('.ComponentStateCardTitle')).toHaveText('Secrets')
  await expect(card.locator('.ComponentStateCardStatus')).toHaveText('State API unavailable')
  await expect(card).toHaveAttribute('disabled', '')
}
