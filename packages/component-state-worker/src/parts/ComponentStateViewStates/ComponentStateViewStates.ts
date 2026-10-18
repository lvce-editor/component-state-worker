import * as ViewletRegistry from '@lvce-editor/viewlet-registry'
import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'

export const {
  createDirectEventCommandMap,
  dispose,
  get,
  getCommandIds,
  registerCommands,
  set,
  wrapSerialCommand: wrapCommand,
} = ViewletRegistry.create<ComponentStateViewState>()
