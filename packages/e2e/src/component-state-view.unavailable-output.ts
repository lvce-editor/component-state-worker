import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.unavailable-output'

export const test: Test = async ({ ComponentState, Developer, expect, Locator, Output, Settings }) => {
  await Settings.update({ 'componentStateView.showUnavailableComponents': true, 'editor.fontFamily': 'monospace' })
  await Output.show()
  const view = Locator('.Output')
  await expect(view).toBeVisible()
  await Developer.openComponentState()
  const components = await ComponentState.getComponents()
  const component = components.find((item) => item.moduleId === 'Output')
  if (!component || component.editable) {
    throw new Error(`Expected Output without a state API; add a live-edit test when supported: ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  const cardTitle = card.locator('.ComponentStateCardTitle')
  await expect(cardTitle).toHaveText('Output')
  const cardStatus = card.locator('.ComponentStateCardStatus')
  await expect(cardStatus).toHaveText('State API unavailable')
  await expect(card).toHaveAttribute('disabled', '')
}
