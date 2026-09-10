import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.context-menu'

// Requires the renderer menu-worker port bridge in the server dependency.
export const skip = 1

export const test: Test = async ({ ComponentState, ContextMenu, Developer, expect, Locator, SideBar }) => {
  await SideBar.open('Explorer')
  await Developer.openComponentState()
  const components = await ComponentState.getComponents()
  const component = components.find((item) => item.moduleId === 'Explorer')
  if (!component?.editable) {
    throw new Error('Expected an editable Explorer component with a DOM')
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click -- the component card context-menu event is the behavior under test
  await card.click({ button: 'right' })
  await ContextMenu.selectItem('Show Dom')
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${component.uid}.json`)
}
