import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'component-state-view.unavailable-components-hidden'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
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

  const unavailableCard = Locator(`.ComponentStateCard[data-uid="${unavailableComponent.uid}"]`)
  await expect(unavailableCard).toHaveCount(0)
}
