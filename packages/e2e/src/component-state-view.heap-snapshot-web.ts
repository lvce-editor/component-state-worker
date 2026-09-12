import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.heap-snapshot-web'

export const test: Test = async ({ ComponentState, Developer, expect, Locator, SideBar }) => {
  await SideBar.open('Explorer')
  const components = await ComponentState.getComponents()
  const explorer = components.find((component) => component.moduleId === 'Explorer')
  if (!explorer) {
    throw new Error('Explorer component not found')
  }
  await Developer.openComponentState()
  const card = Locator(`.ComponentStateCard[data-uid="${explorer.uid}"]`)
  await card.click({ button: 'right' })
  const action = Locator('[role="menuitem"]:has-text("Show Heap Snapshot")')
  await expect(action).toBeVisible()
  await expect(action).toHaveAttribute('aria-disabled', 'true')
}
