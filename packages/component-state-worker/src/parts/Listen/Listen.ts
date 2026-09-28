import * as InitializeEditorWorker from '../InitializeEditorWorker/InitializeEditorWorker.ts'
import * as InitializeMainProcess from '../InitializeMainProcess/InitializeMainProcess.ts'
import * as InitializeRendererWorker from '../InitializeRendererWorker/InitializeRendererWorker.ts'
import * as RegisterCommands from '../RegisterCommands/RegisterCommands.ts'

export const listen = async (): Promise<void> => {
  RegisterCommands.registerCommands()
  await Promise.all([
    InitializeRendererWorker.initializeRendererWorker(),
    InitializeEditorWorker.initializeEditorWorker(),
    InitializeMainProcess.initializeMainProcess(),
  ])
}
