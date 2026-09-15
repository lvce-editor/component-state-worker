import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'viewlet.component-state-edit-problems'

export const test: Test = async ({ Command, Editor, expect, Locator, Main }) => {
  await Command.execute('Layout.showPanel', 'Problems')
  const problemsMessage = Locator('.Problems .Message')
  await expect(problemsMessage).toBeVisible()
  const filter = Locator('.Panel .InputBox')
  await expect(filter).toBeVisible()
  for (const command of ['Problems.viewAsTable', 'Problems.viewAsList']) {
    await Command.execute(command)
    const problemsMessage2 = Locator('.Problems .Message')
    await expect(problemsMessage2).toBeVisible()
    await expect(filter).toBeVisible()
  }
  await Command.execute('Developer.openComponentState')
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const component = components.find((item) => item.moduleId === 'Problems')
  if (!component?.editable) {
    throw new Error(`Expected an editable Problems component, got ${JSON.stringify(components)}`)
  }

  // eslint-disable-next-line e2e/no-direct-click -- verifies the component state card, menu, or input interaction
  await Locator(`.ComponentStateCard[data-uid="${component.uid}"]`).click()
  const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
  await expect(selectedTabTitle).toHaveText(`${component.uid}.json`)
  const editorView = Locator('.Editor')
  await expect(editorView).toContainText('{')
  const state = JSON.parse(await Editor.getText())
  await Editor.setText(`${JSON.stringify({ ...state, filterValue: 'live state filter', inputSource: 2 }, null, 2)}\n`)
  await Main.save()

  const updatedState = await Command.execute('ComponentState.getState', component.uid)
  if (updatedState.filterValue !== 'live state filter') {
    throw new Error(`Expected Problems filter to update, got ${updatedState.filterValue}`)
  }
  await expect(filter).toHaveValue('live state filter')
}
