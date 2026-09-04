import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'component-state-view.open-state'

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Workspace.setPath(tmpDir)
  await Command.execute('Layout.showSideBar', 'Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  await Command.execute('Developer.openComponentState')

  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const explorer = components.find((component) => component.moduleId === 'Explorer')
  if (!explorer || !explorer.editable) {
    throw new Error(`Expected an editable Explorer component, got ${JSON.stringify(components)}`)
  }
  const explorerCard = Locator(`.ComponentStateCard[data-uid="${explorer.uid}"]`)
  // eslint-disable-next-line e2e/no-direct-click -- verifies that a rendered component card opens its live JSON state
  await explorerCard.click()

  const waitForEditorText = async (retries = 50): Promise<string> => {
    try {
      return await Editor.getText()
    } catch (error) {
      if (retries === 0) {
        throw error
      }
      await Command.execute('Timeout.sleep', 100)
      return waitForEditorText(retries - 1)
    }
  }
  const content = await waitForEditorText()
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${explorer.uid}.json`)
  const state = JSON.parse(content)
  const { uid } = state
  if (uid !== explorer.uid) {
    throw new Error(`Expected state uid ${explorer.uid}, got ${uid}`)
  }
}
