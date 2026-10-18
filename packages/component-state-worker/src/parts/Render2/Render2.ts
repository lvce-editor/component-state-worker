import { ViewletCommand } from '@lvce-editor/constants'
import * as ComponentStateViewStates from '../ComponentStateViewStates/ComponentStateViewStates.ts'
import * as Diff2 from '../Diff2/Diff2.ts'
import { getComponentStateVirtualDom } from '../GetComponentStateVirtualDom/GetComponentStateVirtualDom.ts'
import { queueRender } from '../QueueRender/QueueRender.ts'
import { renderDragData } from '../RenderDragData/RenderDragData.ts'

export const render2 = (uid: number, diffResult: readonly number[]): readonly any[] | Promise<readonly any[]> => {
  const pendingDiffs = [...new Set([...diffResult, ...Diff2.diff2(uid)])]
  const { oldState, scheduledState: newState } = ComponentStateViewStates.get(uid)
  const commands: any[] = []
  if (pendingDiffs.includes(1)) {
    commands.push([ViewletCommand.SetDom2, uid, getComponentStateVirtualDom(newState.components, newState.loaded, newState.columnCount)])
  }
  if (pendingDiffs.includes(2)) {
    commands.push(renderDragData(newState))
  }
  return queueRender(uid, commands, oldState, newState)
}
