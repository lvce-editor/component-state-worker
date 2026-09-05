import { ViewletCommand } from '@lvce-editor/constants'
import * as ComponentStateViewStates from '../ComponentStateViewStates/ComponentStateViewStates.ts'
import { getComponentStateVirtualDom } from '../GetComponentStateVirtualDom/GetComponentStateVirtualDom.ts'

export const render2 = (uid: number, diffResult: readonly number[]): readonly any[] => {
  const { newState } = ComponentStateViewStates.get(uid)
  ComponentStateViewStates.set(uid, newState, newState)
  const commands: any[] = []
  if (diffResult.includes(1)) {
    commands.push([ViewletCommand.SetDom2, uid, getComponentStateVirtualDom(newState.components, newState.loaded, newState.width)])
  }
  if (diffResult.includes(2)) {
    const { dragUri } = newState
    commands.push([
      'Viewlet.setDragData',
      uid,
      {
        items: dragUri
          ? [
              { data: dragUri, type: 'text/uri-list' },
              { data: dragUri, type: 'text/plain' },
            ]
          : [],
      },
    ])
  }
  return commands
}
