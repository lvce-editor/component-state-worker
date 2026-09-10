import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.unavailable-components-hidden'

export const test: Test = async ({ ComponentState, Developer, expect, FileSystem, Locator, Settings, SideBar, Workspace }) => {
  await Settings.update({ 'componentStateView.showUnavailableComponents': false })
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

  const unavailableCard = Locator(`.ComponentStateCard[data-uid="${unavailableComponent.uid}"]`)
  await expect(unavailableCard).toHaveCount(0)
}
