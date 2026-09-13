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
    const cardTitle = card.locator('strong.ComponentStateCardTitle')
    await expect(cardTitle).toHaveCount(1)
    const cardUid = card.locator('span.ComponentStateCardUid')
    await expect(cardUid).toHaveCount(1)
    const cardStatus = card.locator('span.ComponentStateCardStatus')
    await expect(cardStatus).toHaveCount(1)
  }
}
