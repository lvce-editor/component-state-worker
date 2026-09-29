import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'
import * as LiveComponentSavedStateUri from '../LiveComponentSavedStateUri/LiveComponentSavedStateUri.ts'
import * as LiveComponentStateUri from '../LiveComponentStateUri/LiveComponentStateUri.ts'
import * as OpenUri from '../OpenUri/OpenUri.ts'

export const handleClick = async (state: ComponentStateViewState, uid: string): Promise<ComponentStateViewState> => {
  const { components, uid: viewUid } = state
  const component = components.find((item) => item.uid === Number(uid) && (item.editable || item.savedStateAvailable))
  if (!component) {
    return state
  }
  const uri = component.editable ? LiveComponentStateUri.toUri(component.uid) : LiveComponentSavedStateUri.toUri(component.uid)
  await OpenUri.openUri(viewUid, uri)
  return state
}
