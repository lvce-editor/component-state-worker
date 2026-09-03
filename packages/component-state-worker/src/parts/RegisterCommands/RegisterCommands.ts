import * as CommandMap from '../CommandMap/CommandMap.ts'
import * as ComponentStateViewStates from '../ComponentStateViewStates/ComponentStateViewStates.ts'

export const registerCommands = (): void => {
  ComponentStateViewStates.registerCommands(CommandMap.viewCommandMap)
}
