import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'viewlet.component-state-edit-process-explorer'

export const test: Test = async ({ Command, Editor, expect, Locator, Main }) => {
  await Command.execute('Developer.openProcessExplorer')
  await Command.execute('ProcessExplorer.setUpdateInterval', 0)
  await Command.execute('Developer.openComponentState')
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const component = components.find((item) => item.moduleId === 'ProcessExplorer')
  if (!component?.editable) {
    throw new Error(`Expected an editable ProcessExplorer component, got ${JSON.stringify(components)}`)
  }

  // eslint-disable-next-line e2e/no-direct-click, @typescript-eslint/no-deprecated -- verifies the component state card, menu, or input interaction
  await Locator(`.ComponentStateCard[data-uid="${component.uid}"]`).click()
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${component.uid}.json`)
  const editorView = Locator('.Editor')
  await expect(editorView).toContainText('{')
  const state = await Editor.getTextAsJson()
  await Editor.setJsonAsText({ ...state, errorMessage: 'Live State Error' })
  await Main.save()

  const updatedState = await Command.execute('ComponentState.getState', component.uid)
  if (updatedState.errorMessage !== 'Live State Error') {
    throw new Error(`Expected ProcessExplorer error message to update, got ${updatedState.errorMessage}`)
  }
  await Command.execute('Developer.openProcessExplorer')
  const processExplorerError = Locator('.ProcessExplorerError')
  await expect(processExplorerError).toContainText('Live State Error')
}
