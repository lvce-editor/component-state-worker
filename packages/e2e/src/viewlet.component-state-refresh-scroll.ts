import type { ComponentInfo, Test } from '@lvce-editor/test-with-playwright'
// eslint-disable-next-line e2e/no-imports -- share the asynchronous state assertion across migration regressions
import { waitForState } from './_waitForState.ts'

export const name = 'viewlet.component-state-refresh-scroll'

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Main, Settings, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Settings.update({ 'editor.fontFamily': 'monospace', 'editor.lineNumbers': true })
  await Workspace.setPath(tmpDir)
  await Command.execute('Layout.showSideBar', 'Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const explorer = components.find((component) => component.moduleId === 'Explorer')
  if (!explorer) {
    throw new Error('Expected a live Explorer component')
  }
  await Main.openUri(`live-component-state:///${explorer.uid}.json`)
  const firstEditorLineNumber = Locator('.Editor .LineNumber').first()
  await expect(firstEditorLineNumber).toBeVisible()
  const selections = [2, 1, 2, 3]
  await Command.execute('GetActiveEditor.setSelections', selections)
  await Editor.setDeltaY(120)
  const firstLine = Locator('.Editor .LineNumber').first()
  await expect(firstLine).toHaveText('7')
  for (const focusedIndex of [1, 0, 1]) {
    const state = await Command.execute('ComponentState.getState', explorer.uid)
    await Command.execute('ComponentState.setState', explorer.uid, { ...state, focusedIndex })
    await waitForState(
      async () => JSON.parse(await Editor.getText()),
      (value) => value.focusedIndex === focusedIndex,
      `live focusedIndex ${focusedIndex}`,
      2000,
    )
    await expect(firstLine).toHaveText('7')
    const actualSelections = await Command.execute('GetActiveEditor.getSelections')
    if (JSON.stringify(actualSelections) !== JSON.stringify(selections)) {
      throw new Error(`Component state refresh changed the selection: ${JSON.stringify(actualSelections)}`)
    }
  }
}
