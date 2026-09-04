import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'component-state-view.cards'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Workspace.setPath(tmpDir)
  await Command.execute('Layout.showSideBar', 'Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  await Command.execute('Developer.openComponentState')

  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const explorer = components.find((component) => component.moduleId === 'Explorer')
  if (!explorer) {
    throw new Error(`Expected an Explorer component, got ${JSON.stringify(components)}`)
  }
  const explorerCard = Locator(`.ComponentStateCard[data-uid="${explorer.uid}"]`)
  await expect(explorerCard).toBeVisible()
  await expect(explorerCard.locator('.ComponentStateCardTitle')).toHaveText('Explorer')
  await expect(explorerCard.locator('.ComponentStateCardUid')).toContainText('uid ')
  await expect(explorerCard.locator('.ComponentStateCardStatus')).toHaveText('Open JSON state')
}
