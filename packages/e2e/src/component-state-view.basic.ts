import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.basic'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Workspace.setPath(tmpDir)
  await Command.execute('Layout.showSideBar', 'Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  await Command.execute('Developer.openComponentState')

  const view = Locator('.ComponentStateView')
  await expect(view).toBeVisible()
  await expect(view.locator('.ComponentStateHeading')).toHaveText('Live Component State')
  await expect(view.locator('.ComponentStateDescription')).toContainText('live components')
  const refreshButton = view.locator('button[aria-label="Refresh"]')
  await expect(refreshButton).toBeVisible()
  await expect(refreshButton).toHaveAttribute('title', 'Refresh')
}
