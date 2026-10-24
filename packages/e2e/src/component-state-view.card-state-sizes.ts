import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.card-state-sizes'

export const test: Test = async ({ ComponentState, Developer, expect, FileSystem, Locator, Settings, SideBar, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Settings.update({ 'componentStateView.showStateSize': true })
  await Workspace.setUri(tmpDir)
  await SideBar.open('Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  const allComponents = await ComponentState.getComponents()
  const components = allComponents.filter((component) => component.editable)
  await Developer.openComponentState()

  for (const component of components) {
    const state = await ComponentState.getState(component.uid)
    const serializedState = JSON.stringify(state)
    const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
    const uid = card.locator('.ComponentStateCardUid')
    await expect(uid).toHaveText(`uid ${component.uid} (${serializedState.length} bytes)`)
  }
}
