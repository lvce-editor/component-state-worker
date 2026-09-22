import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly domAvailable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'viewlet.component-state-show-dom'

export const test: Test = async ({ Command, Editor, expect, ExtensionDetail, ExtensionSearch, FileSystem, Locator, Workspace }) => {
  const checkDom = async (moduleId: string): Promise<void> => {
    const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
    const component = components.find((item) => item.moduleId === moduleId)
    if (!component?.domAvailable) {
      throw new Error(`Expected a DOM API for ${moduleId}`)
    }
    const cardTitle = Locator(`.ComponentStateCard[data-uid="${component.uid}"] .ComponentStateCardTitle`)
    await expect(cardTitle).toBeVisible()
    // Dispatch the menu event directly: the test runner's right-click helper also emits a normal click.
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- exercise the component card or DOM event under test
    await cardTitle.dispatchEvent('contextmenu', {
      bubbles: true,
      button: 2,
      cancelable: true,
      clientX: 100,
      clientY: 100,
    } as unknown as string)
    const menu2 = Locator('.Menu')
    await expect(menu2).toBeVisible()
    const showDom = Locator('.Menu .MenuItem', { hasText: 'Show Dom' })
    await expect(showDom).toHaveCount(1)
    await expect(showDom).toHaveAttribute('aria-disabled', null)
    // eslint-disable-next-line e2e/no-direct-click, @typescript-eslint/no-deprecated -- verifies the component state card, menu, or input interaction
    await showDom.click()
    await expect(menu2).toBeHidden()
    const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
    await expect(selectedTabTitle).toHaveText(`${component.uid}.json`)
    const editorView = Locator('.Editor')
    await expect(editorView).toContainText('childCount')
    const dom = JSON.parse(await Editor.getText())
    if (!Array.isArray(dom) || dom.every((node) => !node.className?.split(' ').includes(moduleId))) {
      throw new Error(`Expected ${moduleId} virtual DOM, got ${JSON.stringify(dom)}`)
    }
    const uri = `live-component-state:///dom/${component.uid}.json`
    const content = await FileSystem.readFile(uri)
    if (!content.endsWith('\n') || !content.includes('\n  {')) {
      throw new Error('Expected formatted virtual DOM JSON')
    }
  }
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Workspace.setUri(tmpDir)
  await Command.execute('Layout.showSideBar', 'Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  await Command.execute('Developer.openComponentState')
  await checkDom('Explorer')
  await Command.execute('Layout.showSideBar', 'Search')
  const searchView = Locator('.Search')
  await expect(searchView).toBeVisible()
  await checkDom('Search')
  await ExtensionSearch.open()
  await checkDom('Extensions')
  await ExtensionDetail.open('builtin.theme-atom-one-dark')
  const extensionDetail = Locator('.ExtensionDetail')
  await expect(extensionDetail).toBeVisible()
  await checkDom('ExtensionDetail')
  await checkDom('Main')
  await checkDom('TitleBar')
  await checkDom('StatusBar')
  await Command.execute('Layout.showPanel', 'Problems')
  const problemsView = Locator('.Problems')
  await expect(problemsView).toBeVisible()
  await checkDom('Problems')
}
