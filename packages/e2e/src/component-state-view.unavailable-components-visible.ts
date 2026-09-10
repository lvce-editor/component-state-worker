import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.unavailable-components-visible'

export const test: Test = async ({ ComponentState, Developer, expect, FileSystem, Locator, Settings, SideBar, Workspace }) => {
  await Settings.update({ 'componentStateView.showUnavailableComponents': true })
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Workspace.setPath(tmpDir)
  await SideBar.open('Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  await Developer.openComponentState()

  const components = await ComponentState.getComponents()
  const unavailableComponent = components.find((component) => !component.editable)
  if (!unavailableComponent) {
    throw new Error(`Expected an unavailable component, got ${JSON.stringify(components)}`)
  }

  const card = Locator(`.ComponentStateCard[data-uid="${unavailableComponent.uid}"]`)
  await expect(card).toBeVisible()
  await expect(card).toHaveAttribute('disabled', '')
  await expect(card.locator('.ComponentStateCardStatus')).toHaveText('State API unavailable')
}
