import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.edit-live-layout'

export const test: Test = async ({ ComponentState, Developer, expect, FileSystem, Locator, Settings }) => {
  await Settings.update({ 'componentStateView.showUnavailableComponents': true, 'editor.fontFamily': 'monospace' })
  await Developer.openComponentState()
  const component = await ComponentState.getComponent('Layout')
  if (!component.editable) {
    throw new Error('Expected Layout to expose editable component state')
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card.locator('.ComponentStateCardStatus')).toHaveText('Open JSON state')
  const state = await ComponentState.getState<{ readonly sideBarWidth: number }>(component.uid)
  const { sideBarWidth: originalWidth } = state
  const sideBarWidth = originalWidth === 320 ? 340 : 320
  const sideBar = Locator('.SideBar').first()
  try {
    await FileSystem.writeFile(`live-component-state:///${component.uid}.json`, JSON.stringify({ ...state, sideBarWidth }))
    await expect(sideBar).toHaveCSS('width', `${sideBarWidth}px`)
  } finally {
    await ComponentState.setState(component.uid, state)
  }
}
