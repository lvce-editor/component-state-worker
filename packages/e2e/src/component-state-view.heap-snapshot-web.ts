import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.heap-snapshot-web'

export const test: Test = async ({ Command, ComponentState, Developer, expect, Locator, SideBar }) => {
  await SideBar.open('Explorer')
  const components = await ComponentState.getComponents()
  const explorer = components.find((component) => component.moduleId === 'Explorer')
  if (!explorer) {
    throw new Error('Explorer component not found')
  }
  await Developer.openComponentState()
  const card = Locator(`.ComponentStateCard[data-uid="${explorer.uid}"]`)
  await expect(card).toBeVisible()
  const view = await ComponentState.getComponent('ComponentState')
  await Command.execute('Viewlet.executeViewletCommand', view.uid, 'handleContextMenu', String(explorer.uid), 100, 100)
  const action = Locator('[role="menuitem"]', { hasText: 'Show Heap Snapshot' })
  await expect(action).toBeVisible()
  await expect(action).toHaveAttribute('aria-disabled', 'true')
}
