import * as Assert from '@lvce-editor/assert'
import { RendererWorker } from '@lvce-editor/rpc-registry'
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

export const handleEditorChanged = async (_editorUid: number, uri: string): Promise<void> => {
  let componentUid: number
  try {
    componentUid = LiveComponentStateUri.getUid(uri)
  } catch {
    return
  }
  const textDocument = await RendererWorker.invoke('GetActiveEditor.getTextDocument')
  if (!textDocument || textDocument.uri !== uri) {
    return
  }
  const state = parseState(textDocument.text)
  if (!state) {
    return
  }
  await RendererWorker.invoke('ComponentState.setState', componentUid, state)
}
