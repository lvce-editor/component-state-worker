import type { Test } from '@lvce-editor/test-with-playwright'
// eslint-disable-next-line e2e/no-imports -- share the asynchronous state assertion across migration regressions
import { waitForState } from './_waitForState.ts'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'viewlet.component-state-edit-explorer'

export const test: Test = async ({ Command, Editor, expect, Explorer, FileSystem, Locator, Main, Settings, Workspace }) => {
  await Command.execute('ExtensionManagement.activateByEvent', 'onLanguage:json', '', 0)
  await Command.execute('Layout.handleExtensionsChanged')
  await Settings.update({ 'editor.fontFamily': 'monospace', 'editor.lineNumbers': 'on' })
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.setFiles([
    { content: 'first', uri: `${tmpDir}/a.txt` },
    { content: 'second', uri: `${tmpDir}/b.txt` },
  ])
  await Workspace.setUri(tmpDir)
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  const secondFile = Locator('.Explorer .TreeItem[aria-label="b.txt"]')
  await expect(secondFile).toBeVisible()

  await Command.execute('Developer.openComponentState')
  const componentView = Locator('.ComponentStateView')
  await expect(componentView).toBeVisible()

  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const explorer = components.find((component) => component.moduleId === 'Explorer')
  if (!explorer || !explorer.editable) {
    throw new Error(`Expected an editable Explorer component, got ${JSON.stringify(components)}`)
  }

  const card = Locator(`.ComponentStateCard[data-uid="${explorer.uid}"]`)
  await expect(card).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click, @typescript-eslint/no-deprecated -- verifies the component state card, menu, or input interaction
  await card.click()

  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${explorer.uid}.json`)
  await Explorer.focusIndex(1)
  await waitForState(
    async () => JSON.parse(await Editor.getText()),
    ({ focusedIndex }) => focusedIndex === 1,
    'Explorer focusedIndex 1',
  )

  const state = JSON.parse(await Editor.getText())
  await Editor.setDeltaY(120)
  const firstVisibleLine = Locator('.Editor .LineNumber').first()
  await expect(firstVisibleLine).toBeVisible()
  await expect(firstVisibleLine).toHaveText('7')
  await Command.execute('ComponentState.setState', explorer.uid, state)
  await waitForState(
    async () => JSON.parse(await Editor.getText()),
    ({ focusedIndex }) => focusedIndex === 1,
    'unchanged Explorer focusedIndex',
  )
  await expect(firstVisibleLine).toBeVisible()
  await expect(firstVisibleLine).toHaveText('7')

  await Editor.setText(`${JSON.stringify({ ...state, focusedIndex: 0 }, null, 2)}\n`)
  await Main.save()

  const updatedState = await Command.execute('ComponentState.getState', explorer.uid)
  if (updatedState.focusedIndex !== 0) {
    throw new Error(`Expected Explorer focusedIndex to be 0, got ${updatedState.focusedIndex}`)
  }
  const firstExplorerTreeItem = Locator('.Explorer .TreeItem').first()
  await expect(firstExplorerTreeItem).toHaveId('TreeItemActive')
}
