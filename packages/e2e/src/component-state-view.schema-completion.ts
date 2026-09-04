import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'component-state-view.schema-completion'

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Main, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Workspace.setPath(tmpDir)
  await Command.execute('Layout.showSideBar', 'Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()

  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
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
