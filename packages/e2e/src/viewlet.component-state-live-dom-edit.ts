import type { ComponentInfo, Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.component-state-live-dom-edit'

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Main, Settings, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.setFiles([
    { content: 'first', uri: `${tmpDir}/a.txt` },
    { content: 'second', uri: `${tmpDir}/b.txt` },
  ])
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  await Workspace.setPath(tmpDir)
  await Command.execute('Layout.showSideBar', 'Explorer')
  const firstItem = Locator('.Explorer .TreeItem[aria-label="a.txt"]')
  await expect(firstItem).toBeVisible()
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const explorer = components.find((component) => component.moduleId === 'Explorer')
  if (!explorer) {
    throw new Error('Expected a live Explorer component')
  }
  const uri = `live-component-state:///dom/${explorer.uid}.json`
  if (await Command.execute('FileSystem.isReadonly', uri)) {
    throw new Error('Live component DOM JSON must be editable')
  }
  await Main.openUri(uri)
  const dom = JSON.parse(await Editor.getText())
  const editedDom = [{ ...dom[0], childCount: 0, className: [dom[0].className, 'LiveEditedDom'].join(' ') }]
  await Editor.setText(`${JSON.stringify(editedDom, null, 2)}\n`)
  const editedExplorer = Locator('.Explorer.LiveEditedDom')
  await expect(editedExplorer).toBeVisible()
  await expect(firstItem).toBeHidden()
  const editorInput = Locator('[name="editor"]')
  await expect(editorInput).toBeFocused()

  await Editor.setText('[')
  await expect(editedExplorer).toBeVisible()
  await Editor.setText(`${JSON.stringify(editedDom, null, 2)}\n`)
  await Main.save()
  await expect(editedExplorer).toBeVisible()

  const state = await Command.execute('ComponentState.getState', explorer.uid)
  const { focusedIndex } = state
  await Command.execute('ComponentState.setState', explorer.uid, { ...state, focusedIndex: focusedIndex === 0 ? 1 : 0 })
  await expect(firstItem).toBeVisible()
  const editedDomView = Locator('.LiveEditedDom')
  await expect(editedDomView).toBeHidden()
}
