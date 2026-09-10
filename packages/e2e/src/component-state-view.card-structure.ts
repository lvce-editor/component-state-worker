import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.card-structure'

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
    const card = Locator(`button.ComponentStateCard[data-uid="${component.uid}"]`)
    await expect(card).toHaveCount(1)
    await expect(card.locator('strong.ComponentStateCardTitle')).toHaveCount(1)
    await expect(card.locator('span.ComponentStateCardUid')).toHaveCount(1)
    await expect(card.locator('span.ComponentStateCardStatus')).toHaveCount(1)
  }
}
