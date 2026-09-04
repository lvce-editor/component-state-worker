import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'component-state-view.unavailable-components-visible'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Main, Settings, Workspace }) => {
  await Main.closeAllEditors()
  await Settings.update({ 'componentStateView.showUnavailableComponents': true })
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Workspace.setPath(tmpDir)
  await Command.execute('Layout.showSideBar', 'Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  await Command.execute('Developer.openComponentState')

  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const unavailableComponent = components.find((component) => !component.editable)
  if (!unavailableComponent) {
    throw new Error(`Expected an unavailable component, got ${JSON.stringify(components)}`)
  }

  const card = Locator(`.ComponentStateCard[data-uid="${unavailableComponent.uid}"]`)
  await expect(card).toBeVisible()
  await expect(card).toHaveAttribute('disabled', '')
  await expect(card.locator('.ComponentStateCardStatus')).toHaveText('State API unavailable')
}
