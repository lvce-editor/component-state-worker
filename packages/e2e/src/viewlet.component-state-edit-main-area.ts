import type { Test } from '@lvce-editor/test-with-playwright'
// eslint-disable-next-line e2e/no-imports -- share the asynchronous state assertion across migration regressions
import { waitForState } from './_waitForState.ts'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'viewlet.component-state-edit-main-area'

export const test: Test = async ({ Command, Editor, expect, Locator, Main }) => {
  await Command.execute('Developer.openComponentState')
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const component = components.find((item) => item.moduleId === 'Main')
  if (!component?.editable) {
    throw new Error(`Expected an editable Main component, got ${JSON.stringify(components)}`)
  }

  // eslint-disable-next-line e2e/no-direct-click -- verifies the component state card, menu, or input interaction
  await Locator(`.ComponentStateCard[data-uid="${component.uid}"]`).click()
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${component.uid}.json`)
  const editorView = Locator('.Editor')
  await expect(editorView).toContainText('{')
  const state = await waitForState(
    async () => JSON.parse(await Editor.getText()),
    ({ layout }) => {
      const { activeGroupId, groups } = layout
      const activeGroup = groups.find((group: { readonly id: number }) => group.id === activeGroupId)
      const activeTab = activeGroup?.tabs.find((tab: { readonly id: number }) => tab.id === activeGroup.activeTabId)
      return activeTab?.loadingState === 'loaded'
    },
    'the Main component-state editor to finish loading',
  )
  const dragOverlay = { height: 40, width: 80, x: 10, y: 10 }
  await Editor.setText(`${JSON.stringify({ ...state, dragOverlay }, null, 2)}\n`)
  const liveDragOverlay = Locator('.Main .DragOverlay')
  await expect(liveDragOverlay).toBeVisible()
  if (!JSON.parse(await Editor.getText()).dragOverlay) {
    throw new Error('Live Main state editor was overwritten before save')
  }
  await Main.save()

  const updatedState = await Command.execute('ComponentState.getState', component.uid)
  if (updatedState.dragOverlay?.width !== 80) {
    throw new Error(`Expected Main drag overlay to update, got ${JSON.stringify(updatedState.dragOverlay)}`)
  }
  if (updatedState.maxOpenEditorGroups !== Infinity || updatedState.maxOpenEditors !== Infinity) {
    throw new Error('Expected Main editor limits to survive the JSON round trip')
  }
  const dragOverlayView = Locator('.Main .DragOverlay')
  await expect(dragOverlayView).toBeVisible()
}
