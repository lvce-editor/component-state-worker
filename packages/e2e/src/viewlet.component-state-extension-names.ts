import type { Test } from '@lvce-editor/test-with-playwright'
// eslint-disable-next-line e2e/no-imports -- share the asynchronous state assertion across migration regressions
import { waitForState } from './_waitForState.ts'

interface ComponentInfo {
  readonly displayName: string
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const name = 'viewlet.component-state-extension-names'

export const test: Test = async ({ ActivityBar, Command, Editor, expect, Extension, Locator }) => {
  await Extension.addWebExtension(new URL('../fixtures/sample.component-state-extension-names/', import.meta.url).href)
  await Extension.enableWorkspace('sample.component-state-extension-names')
  await ActivityBar.handleExtensionsChanged()

  for (const title of ['Hetzner', 'Notes']) {
    const activityBarItem = Locator(`.ActivityBarItem[title="${title}"]`)
    await expect(activityBarItem).toBeVisible()
    // eslint-disable-next-line e2e/no-direct-click -- verifies the component state card, menu, or input interaction
    await activityBarItem.click()
    const components = await waitForState(
      async () => (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[],
      (items) => items.some((item) => item.displayName === `${title} (extension)` && item.moduleId === 'ExtensionView' && item.editable),
      `an editable ${title} extension component`,
    )
    const component = components.find((item) => item.displayName === `${title} (extension)`)!

    await Command.execute('Developer.openComponentState')
    const componentView = Locator('.ComponentStateView')
    await expect(componentView).toBeVisible()
    // eslint-disable-next-line e2e/no-direct-click -- verifies the component state card, menu, or input interaction
    await Locator('.ComponentStateView button[aria-label="Refresh"]').click()

    const card = Locator(`.ComponentStateCard[data-uid="${component.uid}"]`)
    await expect(card).toBeVisible()
    await expect(card.locator('.ComponentStateCardTitle')).toHaveText(`${title} (extension)`)
    // eslint-disable-next-line e2e/no-direct-click -- verifies the component state card, menu, or input interaction
    await card.click()
    const selectedTabTitle = Locator('.MainTabSelected .TabTitle')
    await expect(selectedTabTitle).toHaveText(`${component.uid}.json`)
    const state = JSON.parse(await Editor.getText())
    const { viewId } = state
    if (viewId !== `sample.component-state-${title.toLowerCase()}`) {
      throw new Error(`Expected the ${title} view state, got ${JSON.stringify(state)}`)
    }
  }
}
