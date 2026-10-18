import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'
import * as States from '../ComponentStateViewStates/ComponentStateViewStates.ts'
import * as RendererProcess from '../RendererProcess/RendererProcess.ts'

export const queueRender = (
  uid: number,
  commands: readonly any[],
  oldState: ComponentStateViewState,
  renderedState: ComponentStateViewState,
): readonly any[] | Promise<readonly any[]> => {
  States.set(uid, renderedState, renderedState)
  if (!RendererProcess.isConnected() || commands.length === 0) {
    return commands
  }
  return queueDirect(uid, commands, oldState, renderedState)
}

const isWorkerCommand = (command: readonly any[]): boolean =>
  ['Viewlet.setFocusContext', 'Viewlet.setAdditionalFocus', 'Viewlet.unsetAdditionalFocus'].includes(command[0])

const queueDirect = async (
  uid: number,
  commands: readonly any[],
  oldState: ComponentStateViewState,
  renderedState: ComponentStateViewState,
): Promise<readonly any[]> => {
  const workerCommands = commands.filter(isWorkerCommand)
  const processCommands = commands.filter((command) => !isWorkerCommand(command))
  try {
    const transactionId = await RendererProcess.invoke('Viewlet.queueCommands', uid, [...processCommands, ['Viewlet.setUid', uid, uid]])
    return [...workerCommands, ['Viewlet.commitPending', uid, transactionId]]
  } catch (error) {
    const current = States.get(uid)
    if (current?.oldState === renderedState) {
      States.set(uid, oldState, current.newState, current.scheduledState)
    }
    throw error
  }
}
