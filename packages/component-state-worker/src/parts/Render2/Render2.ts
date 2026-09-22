import { ViewletCommand } from '@lvce-editor/constants'
import * as ComponentStateViewStates from '../ComponentStateViewStates/ComponentStateViewStates.ts'
import { getComponentStateVirtualDom } from '../GetComponentStateVirtualDom/GetComponentStateVirtualDom.ts'
import { renderDragData } from '../RenderDragData/RenderDragData.ts'

export const render2 = (uid: number, diffResult: readonly number[]): readonly any[] => {
  const { newState } = ComponentStateViewStates.get(uid)
  ComponentStateViewStates.set(uid, newState, newState)
  const commands: any[] = []
  if (diffResult.includes(1)) {
    commands.push([ViewletCommand.SetDom2, uid, getComponentStateVirtualDom(newState.components, newState.loaded, newState.columnCount)])
  }
  if (diffResult.includes(2)) {
    commands.push(renderDragData(newState))
  }
  return commands
}
