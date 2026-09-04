import * as ComponentStateViewStates from '../ComponentStateViewStates/ComponentStateViewStates.ts'
import * as Create from '../Create/Create.ts'
import * as Diff2 from '../Diff2/Diff2.ts'
import * as FileSystem from '../FileSystem/FileSystem.ts'
import * as HandleClick from '../HandleClick/HandleClick.ts'
import * as HandleEditorChanged from '../HandleEditorChanged/HandleEditorChanged.ts'
import * as LoadContent from '../LoadContent/LoadContent.ts'
import * as Refresh from '../Refresh/Refresh.ts'
import * as Render2 from '../Render2/Render2.ts'
import * as RenderEventListeners from '../RenderEventListeners/RenderEventListeners.ts'
import * as Resize from '../Resize/Resize.ts'

export const viewCommandMap = {
  'ComponentState.handleClick': ComponentStateViewStates.wrapCommand(HandleClick.handleClick),
  'ComponentState.refresh': ComponentStateViewStates.wrapCommand(Refresh.refresh),
}

export const commandMap = {
  'ComponentState.create': Create.create,
  'ComponentState.diff2': Diff2.diff2,
  'ComponentState.dispose': ComponentStateViewStates.dispose,
  'ComponentState.exists': FileSystem.exists,
  'ComponentState.getCommandIds': ComponentStateViewStates.getCommandIds,
  ...viewCommandMap,
  'ComponentState.isReadonly': FileSystem.isReadonly,
  'ComponentState.loadContent': ComponentStateViewStates.wrapCommand(LoadContent.loadContent),
  'ComponentState.readDirWithFileTypes': FileSystem.readDirWithFileTypes,
  'ComponentState.readFile': FileSystem.readFile,
  'ComponentState.render2': Render2.render2,
  'ComponentState.renderEventListeners': RenderEventListeners.renderEventListeners,
  'ComponentState.resize': ComponentStateViewStates.wrapCommand(Resize.resize),
  'ComponentState.writeFile': FileSystem.writeFile,
  handleEditorChanged: HandleEditorChanged.handleEditorChanged,
}
