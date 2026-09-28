import type { ComponentInfo, Test } from '@lvce-editor/test-with-playwright'
// eslint-disable-next-line e2e/no-imports -- share the asynchronous state assertion across migration regressions
import { waitForState } from './_waitForState.ts'

export const name = 'viewlet.component-state-live-dom'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Main, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.setFiles([
    { content: 'first', uri: `${tmpDir}/a.txt` },
    { content: 'second', uri: `${tmpDir}/b.txt` },
  ])
  await Workspace.setUri(tmpDir)
  await Command.execute('Layout.showSideBar', 'Explorer')
  const firstItem = Locator('.Explorer .TreeItem[aria-label="a.txt"]')
  const secondItem = Locator('.Explorer .TreeItem[aria-label="b.txt"]')
  await expect(firstItem).toBeVisible()
  await expect(secondItem).toBeVisible()
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const explorer = components.find((component) => component.moduleId === 'Explorer')
  if (!explorer) {
    throw new Error('Expected a live Explorer component')
  }
  const uri = `live-component-state:///dom/${explorer.uid}.json`
  await Main.openUri(uri)

  for (const focusedIndex of [1, 0, 1]) {
    const state = await Command.execute('ComponentState.getState', explorer.uid)
    await Command.execute('ComponentState.setState', explorer.uid, { ...state, focusedIndex })
    await waitForState(
      async () => {
        const document = await Command.execute('GetActiveEditor.getTextDocument')
        return JSON.parse(document.text) as readonly { readonly id?: string; readonly ariaLabel?: string }[]
      },
      (dom) => dom.find((node) => node.id === 'TreeItemActive')?.ariaLabel === (focusedIndex === 0 ? 'a.txt' : 'b.txt'),
      'the live DOM editor to reflect the focused Explorer item',
      2000,
    )
  }

  const dom = await Command.execute('ComponentState.getDom', explorer.uid)
  const preview = [{ ...dom[0], childCount: 0, className: [dom[0].className, 'EditedDom'].join(' ') }]
  await Command.execute('ComponentState.setDom', explorer.uid, preview)
  const previewExplorer = Locator('.Explorer.EditedDom')
  await expect(previewExplorer).toBeVisible()
  await expect(firstItem).toBeHidden()
  const previewFile = JSON.parse(await FileSystem.readFile(uri))
  if (JSON.stringify(previewFile) !== JSON.stringify(preview)) {
    throw new Error('The virtual DOM file must reflect the displayed preview')
  }
  const state = await Command.execute('ComponentState.getState', explorer.uid)
  await Command.execute('ComponentState.setState', explorer.uid, { ...state, focusedIndex: 0 })
  await expect(firstItem).toBeVisible()
  await expect(secondItem).toBeVisible()
  await expect(firstItem).toHaveId('TreeItemActive')
  const previewDomView = Locator('.EditedDom')
  await expect(previewDomView).toBeHidden()
}
