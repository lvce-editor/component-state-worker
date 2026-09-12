import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly displayName?: string
  readonly moduleId: string
  readonly uid: number
}

export const name = 'component-state-view.card-titles'

export const test: Test = async ({ ComponentState, Developer, expect, FileSystem, Locator, Settings, SideBar, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Settings.update({ 'componentStateView.showUnavailableComponents': true })
  await Workspace.setPath(tmpDir)
  await SideBar.open('Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  const components = (await ComponentState.getComponents()) as readonly ComponentInfo[]
  await Developer.openComponentState()

  for (const component of components) {
    const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
    const cardTitle = card.locator('.ComponentStateCardTitle')
    await expect(cardTitle).toHaveText(component.displayName || component.moduleId)
  }
}
