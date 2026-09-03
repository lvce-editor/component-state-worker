import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ComponentInfo } from '../ComponentInfo/ComponentInfo.ts'
import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'

export const loadContent = async (state: ComponentStateViewState): Promise<ComponentStateViewState> => {
  const components = (await RendererWorker.invoke('ComponentState.getComponents')) as readonly ComponentInfo[]
  return {
    ...state,
    components,
    loaded: true,
  }
}
