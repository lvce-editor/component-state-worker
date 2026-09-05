import type { Test } from '@lvce-editor/test-with-playwright'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'component-state-view.unavailable-editor'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Main, Settings }) => {
  await Settings.update({ 'componentStateView.showUnavailableComponents': true, 'editor.fontFamily': 'monospace' })
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Main.openUri(`${tmpDir}/file.txt`)
  const view = Locator('.Editor')
  await expect(view).toBeVisible()
  await Command.execute('Developer.openComponentState')
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const component = components.find((item) => item.moduleId === 'Editor')
  if (!component || component.editable) {
    throw new Error(`Expected Editor without a state API; add a live-edit test when supported: ${JSON.stringify(components)}`)
  }
  const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
  await expect(card).toBeVisible()
  await expect(card.locator('.ComponentStateCardTitle')).toHaveText('Editor')
  await expect(card.locator('.ComponentStateCardStatus')).toHaveText('State API unavailable')
  await expect(card).toHaveAttribute('disabled', '')
}
