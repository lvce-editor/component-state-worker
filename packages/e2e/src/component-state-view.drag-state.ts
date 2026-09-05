import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.drag-state'

export const test: Test = async ({
  ComponentState,
  Developer,
  DragAndDrop,
  Editor,
  expect,
  FileSystem,
  Locator,
  Main,
  Settings,
  SideBar,
  Workspace,
}) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  await Workspace.setPath(tmpDir)
  await SideBar.open('Explorer')
  await Developer.openComponentState()

  const { uid } = await ComponentState.getComponent('Explorer')
  const card = Locator(`.ComponentStateCard[data-uid="${uid}"]`)
  await expect(card).toHaveAttribute('draggable', 'true')
  await ComponentState.handlePointerDown(0, uid)
  const uri = `live-component-state:///${uid}.json`
  await DragAndDrop.shouldHaveDragData([
    { data: uri, type: 'text/uri-list' },
    { data: uri, type: 'text/plain' },
  ])
  const editor = Locator('.Editor')
  await expect(editor).toHaveCount(0)
  const dropId = await DragAndDrop.createDropSessionFromDragData()
  await Main.handleDrop(dropId)

  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${uid}.json`)
  await expect(editor).toBeVisible()
  await Editor.shouldContainText(`"uid": ${uid}`)
}
