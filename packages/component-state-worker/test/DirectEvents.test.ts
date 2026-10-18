import type { Rpc } from '@lvce-editor/rpc'
import { beforeEach, expect, jest, test } from '@jest/globals'
import { RendererWorker } from '@lvce-editor/rpc-registry'

const directState: { commands: Readonly<Record<string, (...args: readonly any[]) => Promise<void>>> } = { commands: {} }
const processInvoke = jest.fn<(...args: readonly any[]) => Promise<any>>()
const createRpc = jest.fn(
  async (options: Readonly<{ commandMap: Readonly<Record<string, (...args: readonly any[]) => Promise<void>>> }>) => {
    directState.commands = options.commandMap
    return { invoke: processInvoke }
  },
)

jest.unstable_mockModule('@lvce-editor/rpc', () => ({
  LazyTransferMessagePortRpcParent: { create: async (): Promise<unknown> => ({ invoke: processInvoke }) },
  PlainMessagePortRpc: { create: createRpc },
  WebWorkerRpcClient: { create: async (): Promise<unknown> => ({ invoke: processInvoke }) },
}))

const States = await import('../src/parts/ComponentStateViewStates/ComponentStateViewStates.ts')
const { create } = await import('../src/parts/Create/Create.ts')
const { viewCommandMap } = await import('../src/parts/CommandMap/CommandMap.ts')
const { handleMessagePort } = await import('../src/parts/HandleMessagePort/HandleMessagePort.ts')
const { queueRender } = await import('../src/parts/QueueRender/QueueRender.ts')
const workerInvoke = jest.fn<(...args: readonly any[]) => Promise<any>>()

beforeEach(async () => {
  jest.clearAllMocks()
  workerInvoke.mockResolvedValue(undefined)
  processInvoke.mockResolvedValue(17)
  RendererWorker.set({ invoke: workerInvoke } as unknown as Rpc)
  States.registerCommands(viewCommandMap)
  create(1, 0, 0, 800, 600)
  await handleMessagePort({} as MessagePort)
})

test('dispatches a real input command directly and requests a frame without forwarding it', async () => {
  await directState.commands['Viewlet.executeViewletCommand'](1, 'handlePointerDown', 1, '99')
  expect(workerInvoke.mock.calls).toEqual([['Viewlet.requestRender', 1]])
})

test('serializes mutations, recovers from command failure and ignores disposed work', async () => {
  const { promise, resolve } = Promise.withResolvers<void>()
  States.registerCommands({
    'ComponentState.fail': States.wrapCommand(() => {
      throw new Error('command failed')
    }),
    'ComponentState.last': States.wrapCommand((state) => ({ ...state, testValue: 'last' })),
    'ComponentState.wait': States.wrapCommand(async (state) => {
      await promise
      return { ...state, testValue: 'first' }
    }),
  })
  const first = directState.commands['Viewlet.executeViewletCommand'](1, 'wait')
  const last = directState.commands['Viewlet.executeViewletCommand'](1, 'last')
  resolve()
  await Promise.all([first, last])
  expect(States.get(1).newState).toMatchObject({ testValue: 'last' })
  await expect(directState.commands['Viewlet.executeViewletCommand'](1, 'fail')).rejects.toThrow('command failed')
  await directState.commands['Viewlet.executeViewletCommand'](1, 'last')
  States.dispose(1)
  await directState.commands['Viewlet.executeViewletCommand'](1, 'last')
  expect(States.get(1)).toBeUndefined()
})

test('queues DOM patches, retains focus state locally and preserves updates during rendering', async () => {
  const baseline = States.get(1).newState
  const rendered = { ...baseline }
  States.set(1, baseline, rendered)
  const { promise, resolve } = Promise.withResolvers<number>()
  processInvoke.mockImplementationOnce(() => promise)
  const pending = queueRender(
    1,
    [
      ['Viewlet.setDom2', 1, []],
      ['Viewlet.setFocusContext', 1, 99],
    ],
    baseline,
    rendered,
  )
  const newer = { ...rendered }
  States.set(1, rendered, newer)
  resolve(21)
  expect(await pending).toEqual([
    ['Viewlet.setFocusContext', 1, 99],
    ['Viewlet.commitPending', 1, 21],
  ])
  expect(processInvoke).toHaveBeenCalledWith('Viewlet.queueCommands', 1, [
    ['Viewlet.setDom2', 1, []],
    ['Viewlet.setUid', 1, 1],
  ])
  expect(States.get(1).newState).toBe(newer)
  expect(queueRender(1, [], rendered, newer)).toEqual([])
})

test('retries from the previous baseline after a queue failure without reviving a disposed view', async () => {
  const baseline = States.get(1).newState
  const rendered = { ...baseline }
  const newer = { ...rendered }
  const { promise, reject } = Promise.withResolvers<number>()
  processInvoke.mockImplementationOnce(() => promise)
  const pending = queueRender(1, [['Viewlet.setDom2', 1, []]], baseline, rendered)
  States.set(1, rendered, newer)
  reject(new Error('queue failed'))
  await expect(pending).rejects.toThrow('queue failed')
  expect(States.get(1)).toMatchObject({ newState: newer, oldState: baseline })
  processInvoke.mockImplementationOnce(async () => {
    States.dispose(1)
    throw new Error('disposed')
  })
  await expect(queueRender(1, [['Viewlet.setDom2', 1, []]], baseline, newer)).rejects.toThrow('disposed')
  expect(States.get(1)).toBeUndefined()
})
