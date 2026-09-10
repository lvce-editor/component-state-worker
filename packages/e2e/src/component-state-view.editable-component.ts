import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.editable-component'

export const test: Test = async ({ ComponentState, Developer, expect, FileSystem, Locator, SideBar, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Workspace.setPath(tmpDir)
  await SideBar.open('Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  await Developer.openComponentState()

  const components = await ComponentState.getComponents()
  const explorer = components.find((component) => component.moduleId === 'Explorer')
  if (!explorer) {
    throw new Error(`Expected an Explorer component, got ${JSON.stringify(components)}`)
  }
  const explorerCard = Locator(`.ComponentStateCard[data-uid="${explorer.uid}"]`)
  await expect(explorerCard).toHaveAttribute('disabled', null)
  await expect(explorerCard.locator('.ComponentStateCardStatus')).toHaveText('Open JSON state')
}
