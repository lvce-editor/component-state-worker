import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'

export const loadContent = async (state: ComponentStateViewState): Promise<ComponentStateViewState> => {
  const [components, showUnavailableComponents] = await Promise.all([
    RendererWorker.getComponents(),
    RendererWorker.getPreference('componentStateView.showUnavailableComponents'),
  ])
  return {
    ...state,
    components: showUnavailableComponents === true ? components : components.filter((component) => component.editable),
    loaded: true,
  }
}
