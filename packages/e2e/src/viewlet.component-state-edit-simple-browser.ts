import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'viewlet.component-state-edit-simple-browser'

// The standard e2e runner is browser-only; this view requires Electron WebContentsView.
export const skip = 1

export const test: Test = async ({ Command, Editor, expect, Locator, Main }) => {
  await Command.execute('Layout.showPreview', 'simple-browser://')
  const simpleBrowserView = Locator('.SimpleBrowser')
  await expect(simpleBrowserView).toBeVisible()
  await Command.execute('Developer.openComponentState')
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const component = components.find((item) => item.moduleId === 'SimpleBrowser')
  if (!component?.editable) {
    throw new Error(`Expected an editable SimpleBrowser component, got ${JSON.stringify(components)}`)
  }

  // eslint-disable-next-line e2e/no-direct-click -- verifies the component state card, menu, or input interaction
  await Locator(`.ComponentStateCard[data-uid="${component.uid}"]`).click()
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${component.uid}.json`)
  const editorView = Locator('.Editor')
  await expect(editorView).toContainText('{')
  const state = JSON.parse(await Editor.getText())
  await Editor.setText(`${JSON.stringify({ ...state, inputValue: 'Live browser state' }, null, 2)}\n`)
  await Main.save()

  const updatedState = await Command.execute('ComponentState.getState', component.uid)
  if (updatedState.inputValue !== 'Live browser state') {
    throw new Error(`Expected SimpleBrowser input to update, got ${JSON.stringify(updatedState.inputValue)}`)
  }
  const simpleBrowserHeaderInputBox = Locator('.SimpleBrowserHeader input.InputBox')
  await expect(simpleBrowserHeaderInputBox).toHaveValue('Live browser state')
}
