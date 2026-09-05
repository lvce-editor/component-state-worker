import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

interface DragData {
  readonly items: readonly { readonly data: string; readonly type: string }[]
}

export const name = 'component-state-view.drag-state'

export const test: Test = async ({ Command, DragAndDrop, Editor, expect, FileSystem, Locator, Settings, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  await Workspace.setPath(tmpDir)
  await Command.execute('Layout.showSideBar', 'Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  await Command.execute('Developer.openComponentState')

  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const explorer = components.find((component) => component.moduleId === 'Explorer')
  if (!explorer?.editable) {
    throw new Error(`Expected an editable Explorer component, got ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${explorer.uid}"]`)
  await expect(card).toHaveAttribute('draggable', 'true')
  // Start on a child to verify that the card supplies the component UID.
  await card.locator('.ComponentStateCardTitle').dispatchEvent('pointerdown', { bubbles: true, button: 0 } as any)
  // DOM event dispatch finishes before the worker has rendered its drag payload.
  const uri = `live-component-state:///${explorer.uid}.json`
  const deadline = Date.now() + 5000
  let dragData: DragData | undefined
  while (Date.now() < deadline) {
    const current = (await Command.execute('Viewlet.getDragData')) as DragData | null
    if (current?.items.some((item) => item.type === 'text/uri-list' && item.data === uri)) {
      dragData = current
      break
    }
  }
  if (!dragData) {
    throw new Error(`Timed out waiting for component URI drag data: ${uri}`)
  }
  if (
    dragData.items.length !== 2 ||
    dragData.items.every((item) => item.type !== 'text/uri-list' || item.data !== uri) ||
    dragData.items.every((item) => item.type !== 'text/plain' || item.data !== uri)
  ) {
    throw new Error(`Expected component URI drag data, got ${JSON.stringify(dragData)}`)
  }
  const editor = Locator('.Editor')
  await expect(editor).toHaveCount(0)
  const dropId = await DragAndDrop.createDropSession(dragData.items.map((item) => ({ kind: 'string', type: item.type, value: item.data })))
  await Command.execute('Main.handleDrop', dropId)

  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${explorer.uid}.json`)
  await expect(editor).toBeVisible()
  const state = JSON.parse(await Editor.getText())
  const { uid } = state
  if (uid !== explorer.uid) {
    throw new Error(`Expected state uid ${explorer.uid}, got ${uid}`)
  }
}
