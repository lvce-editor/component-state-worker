import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.unavailable-editor'

export const test: Test = async ({ ComponentState, Developer, expect, FileSystem, Locator, Main, Settings }) => {
  await Settings.update({ 'componentStateView.showUnavailableComponents': true, 'editor.fontFamily': 'monospace' })
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Main.openUri(`${tmpDir}/file.txt`)
  const view = Locator('.Editor')
  await expect(view).toBeVisible()
  await Developer.openComponentState()
  const components = await ComponentState.getComponents()
  const component = components.find((item) => item.moduleId === 'Editor')
  if (!component || component.editable) {
    throw new Error(`Expected Editor without a state API; add a live-edit test when supported: ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  const cardTitle = card.locator('.ComponentStateCardTitle')
  await expect(cardTitle).toHaveText('Editor')
  const cardStatus = card.locator('.ComponentStateCardStatus')
  await expect(cardStatus).toHaveText('State API unavailable')
  await expect(card).toHaveAttribute('disabled', '')
}
