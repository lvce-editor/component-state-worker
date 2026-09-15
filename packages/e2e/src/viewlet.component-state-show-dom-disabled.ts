import type { ComponentInfo, Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.component-state-show-dom-problems'

export const test: Test = async ({ Command, Editor, expect, FileSystem, KeyBoard, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  const uri = `${tmpDir}/context-menu.txt`
  await FileSystem.writeFile(uri, 'Keep this editor open')
  await Main.openUri(uri)
  await Command.execute('Layout.showPanel', 'Problems')
  const problemsView = Locator('.Problems')
  await expect(problemsView).toBeVisible()
  await Command.execute('Developer.openComponentState')
  const components = (await Command.execute('ComponentState.getComponents')) as readonly (ComponentInfo & {
    readonly domAvailable: boolean
  })[]
  const component = components.find((item) => item.moduleId === 'Problems')
  if (!component?.editable || !component.domAvailable) {
    throw new Error('Expected Problems to support state and DOM inspection')
  }

  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  // Dispatch the menu event directly: the test runner's right-click helper also emits a normal click.
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- exercise the component card or DOM event under test
  await card.dispatchEvent('contextmenu', {
    bubbles: true,
    button: 2,
    cancelable: true,
    clientX: 100,
    clientY: 100,
  } as unknown as string)
  const showDom = Locator('.Menu .MenuItem', { hasText: 'Show Dom' })
  await expect(showDom).toBeVisible()
  await expect(showDom).toHaveAttribute('aria-disabled', null)
  // eslint-disable-next-line e2e/no-direct-click, @typescript-eslint/no-deprecated -- verifies the component state card, menu, or input interaction
  await showDom.click()
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${component.uid}.json`)
  const editorView = Locator('.Editor')
  await expect(editorView).toContainText('childCount')
  const dom = JSON.parse(await Editor.getText())
  if (!Array.isArray(dom) || dom.every((node) => !node.className?.split(' ').includes('Problems'))) {
    throw new Error('Expected Problems virtual DOM')
  }
  await KeyBoard.press('Escape')
  const menu2 = Locator('.Menu')
  await expect(menu2).toBeHidden()
}
