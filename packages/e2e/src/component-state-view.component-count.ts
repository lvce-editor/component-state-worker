import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.component-count'

export const test: Test = async ({ ComponentState, Developer, expect, FileSystem, Locator, Settings, SideBar, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Settings.update({ 'componentStateView.showUnavailableComponents': true })
  await Workspace.setPath(tmpDir)
  await SideBar.open('Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  await Developer.openComponentState()
  const view = Locator('.ComponentStateView')
  await expect(view).toBeVisible()
  const components = await ComponentState.getComponents()

  if (components.length === 0) {
    throw new Error('Expected at least one live component')
  }
  const description = Locator('.ComponentStateDescription')
  await expect(description).toHaveText(`${components.length} live components`)
}
