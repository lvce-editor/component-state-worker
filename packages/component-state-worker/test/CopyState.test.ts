import { beforeEach, expect, jest, test } from '@jest/globals'
import type { ComponentStateViewState } from '../src/parts/ComponentStateViewState/ComponentStateViewState.ts'

jest.unstable_mockModule('@lvce-editor/rpc-registry', () => ({
  RendererWorker: {
    invoke: jest.fn(),
  },
}))
jest.unstable_mockModule('../src/parts/FileSystem/FileSystem.ts', () => ({
  readFile: jest.fn(),
}))

const { RendererWorker } = await import('@lvce-editor/rpc-registry')
const FileSystem = await import('../src/parts/FileSystem/FileSystem.ts')
const { copyState } = await import('../src/parts/CopyState/CopyState.ts')

beforeEach(() => {
  jest.resetAllMocks()
})

test('copies the serialized state without opening a main-area tab', async () => {
  const state = {} as ComponentStateViewState
  const content = '{"uid":42}\n'
  jest.mocked(FileSystem.readFile).mockResolvedValue(content)
  jest.mocked(RendererWorker.invoke).mockResolvedValue(undefined)

  await expect(copyState(state, 42)).resolves.toBe(state)

  expect(FileSystem.readFile).toHaveBeenCalledWith('live-component-state:///42.json')
  expect(RendererWorker.invoke).toHaveBeenCalledWith('ClipBoard.writeText', content)
})
