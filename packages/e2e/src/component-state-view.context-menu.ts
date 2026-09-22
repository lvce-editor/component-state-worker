import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.context-menu'

export const test: Test = async ({ Command, ComponentState, ContextMenu, Developer, expect, Locator, SideBar }) => {
  await SideBar.open('Explorer')
  await Developer.openComponentState()
  const components = await ComponentState.getComponents()
  const component = components.find((item) => item.moduleId === 'Explorer')
  if (!component?.editable) {
    throw new Error('Expected an editable Explorer component with a DOM')
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  const view = await ComponentState.getComponent('ComponentState')
  await Command.execute('Viewlet.executeViewletCommand', view.uid, 'handleContextMenu', String(component.uid), 100, 100)
  const showDom = Locator('[role="menuitem"]', { hasText: 'Show Dom' })
  await expect(showDom).toBeVisible()
  await ContextMenu.selectItem('Show Dom')
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${component.uid}.json`)
}
