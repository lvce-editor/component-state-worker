import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'component-state-view.schema-diagnostics'

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
  await Editor.setText(`{\n  "$schema": "live-component-state:///schemas/${explorer.uid}.json",\n  "focusedIndex": "first"\n}\n`)
  const editorId = (await Command.execute('GetActiveEditor.getActiveEditorId')) as number
  await Editor.shouldHaveDiagnosticProviderResult(
    [
      {
        columnIndex: 18,
        endColumnIndex: 25,
        endRowIndex: 2,
        message: 'Incorrect type. Expected "number" but received "string".',
        rowIndex: 2,
        source: 'json (schema_validation)',
        type: 'error',
      },
    ],
    editorId,
  )

  await Editor.setText(
    `{\n  "$schema": "live-component-state:///schemas/${explorer.uid}.json",\n  "height": 652.55078125,\n  "scrollBarY": 0\n}\n`,
  )
  await Editor.shouldHaveDiagnosticProviderResult([], editorId)
}
