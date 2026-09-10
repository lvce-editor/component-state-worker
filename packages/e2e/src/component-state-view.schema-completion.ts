import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.schema-completion'

export const test: Test = async ({ ComponentState, Editor, expect, FileSystem, Locator, Main, SideBar, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Workspace.setPath(tmpDir)
  await SideBar.open('Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()

  const components = await ComponentState.getComponents()
  const explorer = components.find((component) => component.moduleId === 'Explorer' && component.editable)
  if (!explorer) {
    throw new Error(`Expected an editable Explorer component, got ${JSON.stringify(components)}`)
  }

  await Main.closeAllEditors()
  await Main.openUri(`live-component-state:///${explorer.uid}.json`)
  await Editor.setText(`{\n  "$schema": "live-component-state:///schemas/${explorer.uid}.json",\n  "focused"\n}\n`)
  await Editor.setCursor(2, 10)
  await Editor.openCompletion()

  const completions = Locator('#Completions')
  const focusedIndexCompletion = Locator('.EditorCompletionItem', { hasText: 'focusedIndex' })
  await expect(completions).toBeVisible()
  await expect(focusedIndexCompletion).toBeVisible()
}
