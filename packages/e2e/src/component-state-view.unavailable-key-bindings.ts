import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.unavailable-key-bindings'

export const test: Test = async ({ ComponentState, Developer, expect, KeyBindingsEditor, Locator, Settings }) => {
  await Settings.update({ 'componentStateView.showUnavailableComponents': true, 'editor.fontFamily': 'monospace' })
  await KeyBindingsEditor.open()
  const view = Locator('.KeyBindings')
  await expect(view).toBeVisible()
  await Developer.openComponentState()
  const components = await ComponentState.getComponents()
  const component = components.find((item) => item.moduleId === 'KeyBindings')
  if (!component || component.editable) {
    throw new Error(`Expected KeyBindings without a state API; add a live-edit test when supported: ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  await expect(card.locator('.ComponentStateCardTitle')).toHaveText('KeyBindings')
  await expect(card.locator('.ComponentStateCardStatus')).toHaveText('State API unavailable')
  await expect(card).toHaveAttribute('disabled', '')
}
