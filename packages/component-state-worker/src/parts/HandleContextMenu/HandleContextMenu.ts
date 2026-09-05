import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'
import * as MenuEntryId from '../MenuEntryId/MenuEntryId.ts'

export const handleContextMenu = async (
  state: ComponentStateViewState,
  uid: string,
  x: number,
  y: number,
): Promise<ComponentStateViewState> => {
  const { components, uid: viewUid } = state
  const componentUid = Number(uid)
  const component = components.find((item) => item.uid === componentUid && item.editable)
  if (!component) {
    return state
  }
  await RendererWorker.invoke('ContextMenu.show2', viewUid, MenuEntryId.ComponentState, x, y, {
    componentUid,
    domAvailable: component.domAvailable,
  })
  return state
}
