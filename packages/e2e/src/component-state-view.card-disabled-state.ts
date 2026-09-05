import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.card-disabled-state'

export const test: Test = async ({ ComponentState, Developer, expect, FileSystem, Locator, Settings, SideBar, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Settings.update({ 'componentStateView.showUnavailableComponents': true })
  await Workspace.setPath(tmpDir)
  await SideBar.open('Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  const components = await ComponentState.getComponents()
  await Developer.openComponentState()

  for (const component of components) {
    const state = component.editable ? 'enabled' : 'disabled'
    const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]:${state}`)
    await expect(card).toHaveCount(1)
    await expect(card).toHaveAttribute('draggable', String(component.editable))
  }
}
