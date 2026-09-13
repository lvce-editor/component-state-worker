import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'component-state-view.basic'

export const test: Test = async ({ Developer, expect, FileSystem, Locator, SideBar, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/file.txt`, 'content')
  await Workspace.setPath(tmpDir)
  await SideBar.open('Explorer')
  const explorerView = Locator('.Explorer')
  await expect(explorerView).toBeVisible()
  await Developer.openComponentState()

  const view = Locator('.ComponentStateView')
  await expect(view).toBeVisible()
  const heading = view.locator('.ComponentStateHeading')
  await expect(heading).toHaveText('Live Component State')
  const description = view.locator('.ComponentStateDescription')
  await expect(description).toContainText('live components')
  const refreshButton = view.locator('button[aria-label="Refresh"]')
  await expect(refreshButton).toBeVisible()
  await expect(refreshButton).toHaveAttribute('title', 'Refresh')
}
