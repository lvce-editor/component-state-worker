import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'component-state-view.main-cache-schema'

export const test: Test = async ({ Command, Editor, FileSystem, Main, Workspace }) => {
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const main = components.find((component) => component.moduleId === 'Main' && component.editable)
  if (!main) {
    throw new Error(`Expected an editable Main component, got ${JSON.stringify(components)}`)
  }
  const schemaUri = `live-component-state:///schemas/${main.uid}.json`
  const schema = JSON.parse(await FileSystem.readFile(schemaUri))
  const cacheSchema = schema.properties.fileIconCache
  if (cacheSchema.additionalProperties?.type !== 'string' || cacheSchema.properties) {
    throw new Error(`Expected a string dictionary schema, got ${JSON.stringify(cacheSchema)}`)
  }

  const tmpDir = await FileSystem.getTmpDir()
  const uri = `${tmpDir}/main-cache.json`
  const fileIconCache = Object.fromEntries(Array.from({ length: 100 }, (_, index) => [`file:///new-${index}.json`, '/file-icons/json.svg']))
  await FileSystem.writeFile(uri, JSON.stringify({ $schema: schemaUri, fileIconCache }, null, 2))
  await Workspace.setPath(tmpDir)
  await Main.openUri(uri)
  const editorId = (await Command.execute('GetActiveEditor.getActiveEditorId')) as number
  await Editor.shouldHaveDiagnosticProviderResult([], editorId)

  await Editor.setText(JSON.stringify({ $schema: schemaUri, fileIconCache: { 'file:///invalid.json': 123 } }, null, 2))
  await Editor.shouldHaveDiagnosticProviderResult(
    [
      {
        columnIndex: 28,
        endColumnIndex: 31,
        endRowIndex: 3,
        message: 'Incorrect type. Expected "string" but received "number".',
        rowIndex: 3,
        source: 'json (schema_validation)',
        type: 'error',
      },
    ],
    editorId,
  )
}
