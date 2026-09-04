import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

interface ExtensionViewState {
  readonly count: number
  readonly uid: number
}

export const name = 'component-state-view.extension-view-state'

// Requires lvce-editor with @lvce-editor/extension-management-worker >= 4.71.0.
export const skip = 1

export const test: Test = async ({ ActivityBar, Command, Editor, expect, Extension, Locator, Main }) => {
  const uri = import.meta.resolve('../fixtures/sample.stateful-extension-view')
  await Extension.addWebExtension(uri)
  await ActivityBar.toggleActivityBarItem('sample.views.stateful')

  const count = Locator('text=Extension count: 1')
  await expect(count).toBeVisible()

  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const extensionView = components.find((component) => component.moduleId === 'ExtensionView' && component.editable)
  if (!extensionView) {
    throw new Error(`Expected an editable extension view component, got ${JSON.stringify(components)}`)
  }

  await Command.execute('Developer.openComponentState')
  const extensionViewCard = Locator(`.ComponentStateCard[data-uid="${extensionView.uid}"]`)
  await expect(extensionViewCard).toBeVisible()
  await expect(extensionViewCard.locator('.ComponentStateCardStatus')).toHaveText('Open JSON state')

  const stateUri = `live-component-state:///${extensionView.uid}.json`
  await Main.openUri(stateUri)
  const state = JSON.parse(await Editor.getText()) as ExtensionViewState
  const { count: initialCount } = state
  if (initialCount !== 1) {
    throw new Error(`Expected extension view count to be 1, got ${initialCount}`)
  }

  await Editor.setText(`${JSON.stringify({ ...state, count: 2 }, null, 2)}\n`)
  await Main.save()

  const updatedCount = Locator('text=Extension count: 2')
  await expect(updatedCount).toBeVisible()
  const updatedState = (await Command.execute('ComponentState.getState', extensionView.uid)) as ExtensionViewState
  const { count: finalCount } = updatedState
  if (finalCount !== 2) {
    throw new Error(`Expected extension view count to be 2, got ${finalCount}`)
  }
}
