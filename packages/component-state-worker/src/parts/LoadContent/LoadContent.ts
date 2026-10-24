import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ComponentInfo } from '../ComponentInfo/ComponentInfo.ts'
import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'

const getComponentWithStateSize = async (component: ComponentInfo): Promise<ComponentInfo> => {
  if (!component.editable) {
    return component
  }
  try {
    const componentState = await RendererWorker.invoke('ComponentState.getState', component.uid)
    const serializedState = JSON.stringify(componentState)
    if (typeof serializedState !== 'string') {
      return component
    }
    return {
      ...component,
      stateSize: serializedState.length,
    }
  } catch {
    return component
  }
}

const getComponentsWithStateSizes = async (components: readonly ComponentInfo[]): Promise<readonly ComponentInfo[]> => {
  return Promise.all(components.map(getComponentWithStateSize))
}

export const loadContent = async (state: ComponentStateViewState): Promise<ComponentStateViewState> => {
  const { uid: viewUid } = state
  const [components, showUnavailableComponents, showStateSize] = await Promise.all([
    RendererWorker.invoke('ComponentState.getComponents', viewUid) as Promise<readonly ComponentInfo[]>,
    RendererWorker.getPreference('componentStateView.showUnavailableComponents'),
    RendererWorker.getPreference('componentStateView.showStateSize'),
  ])
  const visibleComponents =
    showUnavailableComponents === true ? components : components.filter((component) => component.editable || component.savedStateAvailable)
  const loadedComponents = showStateSize === true ? await getComponentsWithStateSizes(visibleComponents) : visibleComponents
  return {
    ...state,
    components: loadedComponents,
    loaded: true,
  }
}
