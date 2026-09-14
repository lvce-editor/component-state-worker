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

  await card.dispatchEvent('contextmenu', { bubbles: true, button: 2, clientX: 110, clientY: 164 } as any)
  const copyState = Locator('[role="menuitem"]', { hasText: 'Copy State as JSON' })
  await expect(copyState).toBeVisible()
  await ContextMenu.selectItem('Copy State as JSON')
  await ClipBoard.shouldHaveText(jsonStatePrefix)
  await expect(componentStateTab).toHaveCount(0)
}
