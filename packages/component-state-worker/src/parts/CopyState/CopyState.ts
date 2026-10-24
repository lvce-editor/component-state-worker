import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'
import * as FileSystem from '../FileSystem/FileSystem.ts'
import * as LiveComponentStateUri from '../LiveComponentStateUri/LiveComponentStateUri.ts'

export const copyState = async (state: ComponentStateViewState, componentUid: number): Promise<ComponentStateViewState> => {
  const uri = LiveComponentStateUri.toUri(componentUid)
  const content = await FileSystem.readFile(uri)
  await RendererWorker.invoke('ClipBoard.writeText', content)
  return state
}
