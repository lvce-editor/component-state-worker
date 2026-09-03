import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'
import * as LiveComponentStateUri from '../LiveComponentStateUri/LiveComponentStateUri.ts'

export const handleClick = async (state: ComponentStateViewState, uid: string): Promise<ComponentStateViewState> => {
  await RendererWorker.invoke('Main.openUri', LiveComponentStateUri.toUri(Number(uid)))
  return state
}
