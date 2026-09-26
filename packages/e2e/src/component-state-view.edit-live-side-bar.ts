import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.edit-live-side-bar'
export const skip = 1

export const test: Test = async ({ ComponentState, Developer, Editor, expect, Locator, Settings, SideBar }) => {
  await Settings.update({ 'editor.fontFamily': 'monospace' })
  await SideBar.open('Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  await Developer.openComponentState()

  const components = await ComponentState.getComponents()
  const sideBar = components.find((component) => component.moduleId === 'SideBar')
  if (!sideBar?.editable) {
    throw new Error(`Expected an editable SideBar component, got ${JSON.stringify(components)}`)
  }
  const { uid } = sideBar
  const card = Locator(`.ComponentStateCard[data-uid="${uid}"]`)
  await expect(card).toBeVisible()
  await expect(card.locator('.ComponentStateCardStatus')).toHaveText('Open JSON state')
  // eslint-disable-next-line e2e/no-direct-click, @typescript-eslint/no-deprecated -- verifies that a rendered component card opens its live JSON state
  await card.click()

  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${uid}.json`)
  const state = JSON.parse(await Editor.getText())
  const { childUid, uid: stateUid } = state
  if (stateUid !== uid) {
    throw new Error(`Expected SideBar state uid ${uid}, got ${stateUid}`)
  }

  await Editor.setText(
    `${JSON.stringify(
      {
        ...state,
        childUid: childUid + 1,
        currentViewletId: 'Search',
        title: 'Live SideBar title',
      },
      null,
      2,
    )}\n`,
  )
  const sideBarTitle = Locator('.SideBarTitleAreaTitle')
  await expect(sideBarTitle).toHaveText('Live SideBar title')
  await expect(explorerView).toBeVisible()
  const updatedState = await ComponentState.getState<{ readonly childUid: number; readonly currentViewletId: string }>(uid)
  if (updatedState.childUid !== childUid || updatedState.currentViewletId !== 'Explorer') {
    throw new Error(`Expected SideBar to retain its Explorer child, got ${JSON.stringify(updatedState)}`)
  }
}
