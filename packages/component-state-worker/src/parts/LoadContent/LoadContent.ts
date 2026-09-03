import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'

export const loadContent = async (state: ComponentStateViewState): Promise<ComponentStateViewState> => {
  const components = await RendererWorker.getComponents()
  return {
    ...state,
    components,
    loaded: true,
  }
}
