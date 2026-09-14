import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.context-menu-copy-state'
const jsonStatePrefix = /^\{\n {2}"\$schema": "live-component-state:\/\/\/schemas\//

export const test: Test = async ({ ClipBoard, ComponentState, ContextMenu, Developer, expect, Locator, SideBar }) => {
  await SideBar.open('Explorer')
  await Developer.openComponentState()
  const components = await ComponentState.getComponents()
  const component = components.find((item) => item.moduleId === 'Explorer')
  if (!component?.editable) {
    throw new Error('Expected an editable Explorer component')
  }

  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  const componentStateTab = Locator(`.MainTab[title$="${component.uid}.json"]`)
  await expect(card).toBeVisible()
  await ClipBoard.enableMemoryClipBoard()

  // eslint-disable-next-line e2e/no-direct-click -- the component card context-menu event is the behavior under test
  await card.click({ button: 'right' })
  await ContextMenu.selectItem('Copy State as JSON')
  await ClipBoard.shouldHaveText(jsonStatePrefix)
  await expect(componentStateTab).toHaveCount(0)
}
