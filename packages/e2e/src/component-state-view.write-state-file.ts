import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'component-state-view.write-state-file'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Settings, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.setFiles([
    { content: 'first', uri: `${tmpDir}/a.txt` },
    { content: 'second', uri: `${tmpDir}/b.txt` },
  ])
  await Settings.update({ 'componentStateView.showUnavailableComponents': true })
  await Workspace.setPath(tmpDir)
  await Command.execute('Layout.showSideBar', 'Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  await Command.execute('Developer.openComponentState')

  const explorer = components.find((component) => component.moduleId === 'Explorer')
  if (!explorer) {
    throw new Error(`Expected an Explorer component, got ${JSON.stringify(components)}`)
  }
  const uri = `live-component-state:///${explorer.uid}.json`
  const state = JSON.parse(await FileSystem.readFile(uri))
  await FileSystem.writeFile(uri, `${JSON.stringify({ ...state, focusedIndex: 1 }, null, 2)}\n`)

  const updatedState = await Command.execute('ComponentState.getState', explorer.uid)
  if (updatedState.focusedIndex !== 1) {
    throw new Error(`Expected Explorer focusedIndex to be 1, got ${updatedState.focusedIndex}`)
  }
  const secondExplorerItem = Locator('.Explorer .TreeItem[aria-label="b.txt"]')
  await expect(secondExplorerItem).toHaveId('TreeItemActive')
}
