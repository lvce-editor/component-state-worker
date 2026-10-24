import { beforeEach, expect, jest, test } from '@jest/globals'
import type { ComponentStateViewState } from '../src/parts/ComponentStateViewState/ComponentStateViewState.ts'

jest.unstable_mockModule('@lvce-editor/rpc-registry', () => ({
  MainProcess: { invoke: jest.fn() },
  RendererWorker: { getWindowId: jest.fn(), invoke: jest.fn() },
}))

const { MainProcess, RendererWorker } = await import('@lvce-editor/rpc-registry')
const { showHeapSnapshot } = await import('../src/parts/ShowHeapSnapshot/ShowHeapSnapshot.ts')
const state: ComponentStateViewState = {
  columnCount: 1,
  components: [{ displayName: 'Explorer', domAvailable: true, editable: true, heapSnapshotAvailable: true, moduleId: 'Explorer', uid: 9 }],
  dragUri: '',
  height: 100,
  loaded: true,
  uid: 7,
  width: 100,
  x: 0,
  y: 0,
}

beforeEach(() => {
  jest.resetAllMocks()
  jest.mocked(RendererWorker.invoke).mockResolvedValue('Explorer Worker')
  jest.mocked(RendererWorker.getWindowId).mockResolvedValue(3)
  jest.mocked(MainProcess.invoke).mockResolvedValue('file:///Downloads/Explorer.heapsnapshot')
})

test('captures the owning worker and opens the saved snapshot in the originating application', async () => {
  await expect(showHeapSnapshot(state, 9)).resolves.toBe(state)
  expect(RendererWorker.invoke).toHaveBeenNthCalledWith(1, 'ComponentState.getWorkerName', 9)
  expect(MainProcess.invoke).toHaveBeenCalledWith('ElectronDeveloper.takeWorkerHeapSnapshot', 3, 'Explorer Worker')
  expect(RendererWorker.invoke).toHaveBeenNthCalledWith(
    2,
    'Application.executeForView',
    7,
    'Main.openUri',
    'file:///Downloads/Explorer.heapsnapshot',
  )
})

test('does not capture missing components or components on web', async () => {
  const { components } = state
  await showHeapSnapshot(state, 10)
  await showHeapSnapshot({ ...state, components: [{ ...components[0], heapSnapshotAvailable: false }] }, 9)
  expect(MainProcess.invoke).not.toHaveBeenCalled()
  expect(RendererWorker.invoke).not.toHaveBeenCalled()
})

test('does not open a file when capture fails', async () => {
  jest.mocked(MainProcess.invoke).mockRejectedValue(new Error('Worker exited'))
  await expect(showHeapSnapshot(state, 9)).rejects.toThrow('Worker exited')
  expect(RendererWorker.invoke).toHaveBeenCalledTimes(1)
})
