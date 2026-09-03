import { beforeEach, expect, jest, test } from '@jest/globals'
import { ViewletCommand } from '@lvce-editor/constants'
import * as ComponentStateViewStates from '../src/parts/ComponentStateViewStates/ComponentStateViewStates.ts'
import { create } from '../src/parts/Create/Create.ts'
import { diff2 } from '../src/parts/Diff2/Diff2.ts'
import { getComponentStateVirtualDom } from '../src/parts/GetComponentStateVirtualDom/GetComponentStateVirtualDom.ts'
import { render2 } from '../src/parts/Render2/Render2.ts'
import { renderEventListeners } from '../src/parts/RenderEventListeners/RenderEventListeners.ts'
import { resize } from '../src/parts/Resize/Resize.ts'

jest.unstable_mockModule('@lvce-editor/rpc-registry', () => ({
  RendererWorker: {
    invoke: jest.fn(),
  },
}))

const { RendererWorker } = await import('@lvce-editor/rpc-registry')
const { handleClick } = await import('../src/parts/HandleClick/HandleClick.ts')
const { loadContent } = await import('../src/parts/LoadContent/LoadContent.ts')

beforeEach(() => {
  ComponentStateViewStates.dispose(7)
  jest.resetAllMocks()
})

test('creates, loads, diffs, and renders the component grid', async () => {
  const components = [{ editable: true, moduleId: 'Explorer', uid: 9 }]
  jest.mocked(RendererWorker.invoke).mockResolvedValue(components)
  create(7, 1, 2, 300, 400)
  const initial = ComponentStateViewStates.get(7).newState
  const loaded = await loadContent(initial)
  ComponentStateViewStates.set(7, initial, loaded, loaded)

  expect(diff2(7)).toEqual([1])
  expect(render2(7, [1])).toEqual([[ViewletCommand.SetDom2, 7, getComponentStateVirtualDom(components, true)]])
  expect(ComponentStateViewStates.get(7).oldState).toBe(loaded)
})

test('returns no diff or render commands for unchanged state', () => {
  create(7, 0, 0, 100, 100)

  expect(diff2(7)).toEqual([])
  expect(render2(7, [])).toEqual([])
})

test('opens the selected component state uri', async () => {
  const invoke = jest.mocked(RendererWorker.invoke).mockResolvedValue(undefined)
  create(7, 0, 0, 100, 100)
  const state = ComponentStateViewStates.get(7).newState

  await expect(handleClick(state, '42')).resolves.toBe(state)
  expect(invoke).toHaveBeenCalledWith('Main.openUri', 'live-component-state:///42.json')
})

test('resizes the view', () => {
  create(7, 0, 0, 100, 100)
  const state = ComponentStateViewStates.get(7).newState

  expect(resize(state, { height: 240, width: 320, x: 3, y: 4 })).toMatchObject({ height: 240, width: 320, x: 3, y: 4 })
})

test('renders editable and unavailable component cards', () => {
  const dom = getComponentStateVirtualDom(
    [
      { editable: true, moduleId: 'Explorer', uid: 1 },
      { editable: false, moduleId: 'Editor', uid: 2 },
    ],
    true,
  )

  expect(dom).toContainEqual(expect.objectContaining({ 'data-uid': '1', disabled: false }))
  expect(dom).toContainEqual(expect.objectContaining({ 'data-uid': '2', disabled: true }))
  expect(renderEventListeners()).toEqual([
    {
      name: 1,
      params: ['handleClick', 'event.currentTarget.dataset.uid'],
      preventDefault: true,
    },
  ])
})

test('renders the loading state before components are available', () => {
  const dom = getComponentStateVirtualDom([], false)

  expect(dom).toContainEqual(expect.objectContaining({ text: 'Loading live components…' }))
})
