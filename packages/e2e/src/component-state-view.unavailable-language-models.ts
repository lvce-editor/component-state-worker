import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.unavailable-language-models'

export const test: Test = async ({ ComponentState, Developer, expect, LanguageModels, Locator, Settings }) => {
  await Settings.update({ 'componentStateView.showUnavailableComponents': true, 'editor.fontFamily': 'monospace' })
  await LanguageModels.open()
  const view = Locator('.LanguageModels')
  await expect(view).toBeVisible()
  await Developer.openComponentState()
  const components = await ComponentState.getComponents()
  const component = components.find((item) => item.moduleId === 'LanguageModels')
  if (!component || component.editable) {
    throw new Error(`Expected LanguageModels without a state API; add a live-edit test when supported: ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  await expect(card.locator('.ComponentStateCardTitle')).toHaveText('LanguageModels')
  await expect(card.locator('.ComponentStateCardStatus')).toHaveText('State API unavailable')
  await expect(card).toHaveAttribute('disabled', '')
}
