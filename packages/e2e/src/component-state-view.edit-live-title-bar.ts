import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'component-state-view.edit-live-title-bar'

export const test: Test = async ({ Command, Editor, expect, Locator }) => {
  await Command.execute('Developer.openComponentState')
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const titleBar = components.find((component) => component.moduleId === 'TitleBar')
  if (!titleBar?.editable) {
    throw new Error(`Expected an editable TitleBar component, got ${JSON.stringify(components)}`)
  }

  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  const titleBarTitle = Locator('.TitleBarTitle')
  // eslint-disable-next-line e2e/no-direct-click -- verifies that opening a component state subscribes its editor to live updates
  await Locator(`.ComponentStateCard[data-uid="${titleBar.uid}"]`).click()
  await expect(selectedTabTitle).toHaveText(`${titleBar.uid}.json`)
  const state = JSON.parse(await Editor.getText())
  await Editor.setText(`${JSON.stringify({ ...state, title: 'Instant Live State' }, null, 2)}\n`)

  const updatedState = await Command.execute('ComponentState.getState', titleBar.uid)
  if (updatedState.title !== 'Instant Live State') {
    throw new Error(`Expected TitleBar title to update immediately, got ${updatedState.title}`)
  }
  await expect(titleBarTitle).toHaveText('Instant Live State')
}
