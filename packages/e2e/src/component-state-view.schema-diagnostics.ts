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

  await Main.openUri(`live-component-state:///${explorer.uid}.json`)
  await Editor.setText(`{\n  "$schema": "live-component-state:///schemas/${explorer.uid}.json",\n  "unknown": true\n}\n`)
  await Editor.enableDiagnostics()

  await Editor.shouldHaveDiagnostics([
    {
      columnIndex: 2,
      endColumnIndex: 11,
      endRowIndex: 2,
      message: 'Property "unknown" is not allowed.',
      rowIndex: 2,
      source: 'json (schema_validation)',
      type: 'error',
    },
  ])
}
