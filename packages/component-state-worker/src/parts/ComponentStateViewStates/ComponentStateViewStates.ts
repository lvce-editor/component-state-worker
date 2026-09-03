import * as ViewletRegistry from '@lvce-editor/viewlet-registry'
import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'

export const { dispose, get, getCommandIds, registerCommands, set, wrapCommand } = ViewletRegistry.create<ComponentStateViewState>()
