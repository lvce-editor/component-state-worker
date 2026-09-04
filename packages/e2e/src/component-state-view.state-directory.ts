import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'component-state-view.state-directory'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Settings, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Settings.update({ 'componentStateView.showUnavailableComponents': true })
  await Workspace.setPath(tmpDir)
  await Command.execute('Layout.showSideBar', 'Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  await Command.execute('Developer.openComponentState')

  const liveComponents = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const actual = await FileSystem.readDir('live-component-state:///')
  const expected = liveComponents.filter((component) => component.editable).map((component) => ({ name: `${component.uid}.json`, type: 7 }))
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected state directory ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}
