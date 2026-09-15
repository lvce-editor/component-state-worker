import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'viewlet.component-state-edit-layout'

export const test: Test = async ({ Command, Editor, expect, Locator, Main }) => {
  await Command.execute('Developer.openComponentState')
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const component = components.find((item) => item.moduleId === 'Layout')
  if (!component?.editable) {
    throw new Error(`Expected an editable Layout component, got ${JSON.stringify(components)}`)
  }

  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click -- verifies the component state card, menu, or input interaction
  await card.click()
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${component.uid}.json`)
  const editorView = Locator('.Editor')
  await expect(editorView).toContainText('{')
  const statusBar = Locator('.StatusBar')
  await expect(statusBar).toBeVisible()
  const state = JSON.parse(await Editor.getText())
  await Editor.setText(`${JSON.stringify({ ...state, sideBarWidth: 320, statusBarVisible: false }, null, 2)}\n`)
  await Main.save()

  const updatedState = await Command.execute('ComponentState.getState', component.uid)
  if (updatedState.sideBarWidth !== 320 || updatedState.statusBarVisible !== false) {
    throw new Error('Expected Layout state edits to update sidebar width and status bar visibility')
  }
  const primarySideBar = Locator('.SideBar:not(.SecondarySideBar)')
  await expect(primarySideBar).toHaveCSS('width', '320px')
  await expect(statusBar).toBeHidden()
}
