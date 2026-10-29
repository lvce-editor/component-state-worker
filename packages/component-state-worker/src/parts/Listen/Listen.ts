import { RendererWorker } from '@lvce-editor/rpc-registry'
import * as CommandMap from '../CommandMap/CommandMap.ts'
import * as EditorChangeListener from '../EditorChangeListener/EditorChangeListener.ts'
import * as InitializeMainProcess from '../InitializeMainProcess/InitializeMainProcess.ts'
import * as RegisterCommands from '../RegisterCommands/RegisterCommands.ts'

export const listen = async (): Promise<void> => {
  RegisterCommands.registerCommands()
  await Promise.all([
    RendererWorker.initializeRendererWorkerForWorker(CommandMap.commandMap),
    RendererWorker.initializeEditorWorker(EditorChangeListener.rpcId),
    InitializeMainProcess.initializeMainProcess(),
  ])
}
