import type { ComponentInfo, Test } from '@lvce-editor/test-with-playwright'
// eslint-disable-next-line e2e/no-imports -- share the asynchronous state assertion across migration regressions
import { waitForState } from './_waitForState.ts'

export const name = 'viewlet.component-state-quick-pick-focus'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Main, QuickPick, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.setFiles([
    { content: 'first', uri: `${tmpDir}/a.txt` },
    { content: 'second', uri: `${tmpDir}/b.txt` },
  ])
  await Workspace.setUri(tmpDir)
  await Command.execute('Layout.showSideBar', 'Explorer')
  await Command.execute('Developer.openComponentState')
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const explorer = components.find((component) => component.moduleId === 'Explorer')
  if (!explorer) {
    throw new Error('Expected a live Explorer component')
  }
  const uri = `live-component-state:///${explorer.uid}.json`
  await Main.openUri(uri)
  const editorView = Locator('.Editor')
  await expect(editorView).toContainText('$schema')
  await Command.execute('QuickPick.showCommands')
  const input = Locator('#QuickPick .InputBox')
  await expect(input).toBeFocused()
  const editorComponents = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const editor = editorComponents.find((component) => component.moduleId === 'Editor' || component.moduleId === 'EditorText')
  if (!editor) {
    throw new Error('Expected an editor component')
  }
  await Command.execute('Viewlet.reload', editor.uid)
  await expect(input).toBeFocused()

  for (const focusedIndex of [1, 0, 1]) {
    const state = await Command.execute('ComponentState.getState', explorer.uid)
    await FileSystem.writeFile(uri, JSON.stringify({ ...state, focused: true, focusedIndex }))
    await waitForState(
      async () => {
        const document = await Command.execute('GetActiveEditor.getTextDocument')
        return JSON.parse(document.text)
      },
      (value) => value.focusedIndex === focusedIndex,
      `live focusedIndex ${focusedIndex}`,
      2000,
    )
    await expect(input).toBeFocused()
  }
  // Flush the edited state through the same save path before checking focus again.
  await Command.execute('Main.save')
  await expect(input).toBeFocused()
  await QuickPick.setValue('>Developer')
  await expect(input).toHaveValue('>Developer')
  await expect(input).toBeFocused()
}
