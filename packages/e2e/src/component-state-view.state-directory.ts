import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.state-directory'

export const test: Test = async ({ ComponentState, Developer, expect, FileSystem, Locator, Settings, SideBar, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Settings.update({ 'componentStateView.showUnavailableComponents': true })
  await Workspace.setPath(tmpDir)
  await SideBar.open('Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  await Developer.openComponentState()

  const liveComponents = await ComponentState.getComponents()
  const actual = await FileSystem.readDir('live-component-state:///')
  const expected = liveComponents.filter((component) => component.editable).map((component) => ({ name: `${component.uid}.json`, type: 7 }))
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected state directory ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}
