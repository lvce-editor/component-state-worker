import type { ComponentInfo, Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.component-state-show-dom-dismiss'

export const test: Test = async ({ Command, Editor, expect, FileSystem, KeyBoard, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  const uri = `${tmpDir}/context-menu.txt`
  await FileSystem.writeFile(uri, 'Keep this editor open')
  await Main.openUri(uri)
  await Command.execute('Developer.openComponentState')
  const components = (await Command.execute('ComponentState.getComponents')) as readonly (ComponentInfo & {
    readonly domAvailable: boolean
  })[]
  const titleBar = components.find((item) => item.moduleId === 'TitleBar')
  const statusBar = components.find((item) => item.moduleId === 'StatusBar')
  if (!titleBar?.domAvailable || !statusBar?.domAvailable) {
    throw new Error('Expected TitleBar and StatusBar DOM inspection')
  }

  const titleBarLabel = Locator(`.ComponentStateCard[data-uid="${titleBar.uid}"] .ComponentStateCardTitle`)
  await expect(titleBarLabel).toBeVisible()
  // Dispatch the menu event directly: the test runner's right-click helper also emits a normal click.
  await titleBarLabel.dispatchEvent('contextmenu', {
    bubbles: true,
    button: 2,
    cancelable: true,
    clientX: 100,
    clientY: 100,
  } as unknown as string)
  const menuMenuItem = Locator('.Menu .MenuItem', { hasText: 'Show Dom' })
  await expect(menuMenuItem).toBeVisible()
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText('context-menu.txt')
  await KeyBoard.press('Escape')
  const menu2 = Locator('.Menu')
  await expect(menu2).toBeHidden()
  await expect(selectedTabTitle).toHaveText('context-menu.txt')

  const statusBarLabel = Locator(`.ComponentStateCard[data-uid="${statusBar.uid}"] .ComponentStateCardStatus`)
  await expect(statusBarLabel).toBeVisible()
  await statusBarLabel.dispatchEvent('contextmenu', {
    bubbles: true,
    button: 2,
    cancelable: true,
    clientX: 100,
    clientY: 100,
  } as unknown as string)
  const showDom = Locator('.Menu .MenuItem', { hasText: 'Show Dom' })
  await expect(showDom).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click -- verifies the component state card, menu, or input interaction
  await showDom.click()
  await expect(menu2).toBeHidden()
  await expect(selectedTabTitle).toHaveText(`${statusBar.uid}.json`)
  const dom = JSON.parse(await Editor.getText())
  if (!Array.isArray(dom) || dom.every((node) => !node.className?.split(' ').includes('StatusBar'))) {
    throw new Error('Expected StatusBar DOM after reopening the menu on its card')
  }
}
