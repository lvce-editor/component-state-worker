import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'component-state-view.state-file-content'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Settings, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
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
  const content = await FileSystem.readFile(uri)
  const fileState = JSON.parse(content)
  const { $schema, ...componentState } = fileState
  const liveState = await Command.execute('ComponentState.getState', explorer.uid)
  if ($schema !== `live-component-state:///schemas/${explorer.uid}.json`) {
    throw new Error(`Expected an Explorer state schema URI, got ${JSON.stringify($schema)}`)
  }
  const schema = JSON.parse(await FileSystem.readFile($schema))
  if (schema.properties?.focusedIndex?.type !== 'integer') {
    throw new Error(`Expected the Explorer schema to describe focusedIndex, got ${JSON.stringify(schema)}`)
  }
  if (JSON.stringify(componentState) !== JSON.stringify(liveState)) {
    throw new Error('Expected the state file to contain the current Explorer state')
  }
  if (!content.endsWith('\n') || !content.includes('\n  "')) {
    throw new Error(`Expected pretty-printed JSON ending in a newline, got ${JSON.stringify(content)}`)
  }
}
