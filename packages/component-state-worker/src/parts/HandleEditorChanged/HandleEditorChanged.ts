import * as Assert from '@lvce-editor/assert'
import { EditorWorker, RendererWorker } from '@lvce-editor/rpc-registry'
import * as LiveComponentStateUri from '../LiveComponentStateUri/LiveComponentStateUri.ts'

const parseState = (content: string): Record<string, unknown> | undefined => {
  try {
    const state: unknown = JSON.parse(content)
    Assert.object(state)
    return state as Record<string, unknown>
  } catch {
    return undefined
  }
}

export const handleEditorChanged = async (editorUid: number, uri: string): Promise<void> => {
  let componentUid: number
  try {
    componentUid = LiveComponentStateUri.getUid(uri)
  } catch {
    return
  }
  const content = await EditorWorker.invoke('Editor.getText', editorUid)
  const state = parseState(content)
  if (!state) {
    return
  }
  await RendererWorker.invoke('ComponentState.setState', componentUid, state)
}
