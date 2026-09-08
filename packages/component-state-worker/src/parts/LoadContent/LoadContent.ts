import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ComponentInfo } from '../ComponentInfo/ComponentInfo.ts'
import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'

export const loadContent = async (state: ComponentStateViewState): Promise<ComponentStateViewState> => {
  const { uid: viewUid } = state
  const [components, showUnavailableComponents] = await Promise.all([
    RendererWorker.invoke('ComponentState.getComponents', viewUid) as Promise<readonly ComponentInfo[]>,
    RendererWorker.getPreference('componentStateView.showUnavailableComponents'),
  ])
  return {
    ...state,
    components: showUnavailableComponents === true ? components : components.filter((component) => component.editable),
    loaded: true,
  }
}
