import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'viewlet.component-state-auto-update'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Workspace.setUri(tmpDir)
  await Command.execute('Layout.showSideBar', 'Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  await Command.execute('Developer.openComponentState')
  const view = Locator('.ComponentStateView')
  await expect(view).toBeVisible()

  const assertComponents = async (): Promise<readonly ComponentInfo[]> => {
    const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
    const editableComponents = components.filter((component) => component.editable)
    if (editableComponents.length === 0) {
      throw new Error('Expected live components without manually refreshing')
    }
    const description = view.locator('.ComponentStateDescription')
    await expect(description).toHaveText(`${editableComponents.length} live components`)
    for (const component of editableComponents) {
      const card = view.locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
      await expect(card).toBeVisible()
    }
    return editableComponents
  }

  const initial = await assertComponents()
  const explorer = initial.find((component) => component.moduleId === 'Explorer')
  if (!explorer) {
    throw new Error('Expected Explorer in the initial component list')
  }

  await Command.execute('Layout.showSideBar', 'Search')
  const searchView = Locator('.Search')
  await expect(searchView).toBeVisible()
  const explorerCard = view.locator(`.ComponentStateCard[data-uid="${explorer.uid}"]`)
  await expect(explorerCard).toHaveCount(0)
  await assertComponents()

  await Command.execute('Layout.openSecondarySideBarViewlet', 'Explorer')
  await expect(view).toHaveCount(0)
  await Command.execute('Developer.openComponentState')
  await expect(view).toBeVisible()
  await assertComponents()

  await Command.execute('Layout.showSideBar', 'Explorer')
  await expect(explorerView).toBeVisible()
  await assertComponents()
}
