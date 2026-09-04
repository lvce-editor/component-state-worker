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

const getEditorContent = async (uri: string): Promise<string | undefined> => {
  const editorKeys = await EditorWorker.invoke('Editor.getKeys')
  for (const editorKey of editorKeys) {
    const editorUid = Number(editorKey)
    const editorUri = await EditorWorker.invoke('Editor.getUri', editorUid)
    if (editorUri === uri) {
      return EditorWorker.invoke('Editor.getText', editorUid)
    }
  }
  return undefined
}

export const handleEditorChanged = async (_editorUid: number, uri: string): Promise<void> => {
  let componentUid: number
  try {
    componentUid = LiveComponentStateUri.getUid(uri)
  } catch {
    return
  }
  const content = await getEditorContent(uri)
  if (content === undefined) {
    return
  }
  const state = parseState(content)
  if (!state) {
    return
  }
  await RendererWorker.invoke('ComponentState.setState', componentUid, state)
}
