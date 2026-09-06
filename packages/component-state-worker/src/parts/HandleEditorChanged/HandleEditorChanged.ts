import * as Assert from '@lvce-editor/assert'
import { EditorWorker, RendererWorker } from '@lvce-editor/rpc-registry'
import * as LiveComponentDomUri from '../LiveComponentDomUri/LiveComponentDomUri.ts'
import * as LiveComponentStateUri from '../LiveComponentStateUri/LiveComponentStateUri.ts'
import * as RemoveSchemaProperty from '../RemoveSchemaProperty/RemoveSchemaProperty.ts'

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
  const isDom = LiveComponentDomUri.is(uri)
  let componentUid: number
  try {
    componentUid = isDom ? LiveComponentDomUri.getUid(uri) : LiveComponentStateUri.getUid(uri)
  } catch {
    return
  }
  const content = await EditorWorker.invoke('Editor.getText', editorUid)
  if (isDom) {
    let dom: unknown
    try {
      dom = JSON.parse(content)
      Assert.array(dom)
    } catch {
      return
    }
    await RendererWorker.invoke('ComponentState.setDom', componentUid, dom)
    return
  }
  const state = parseState(content)
  if (!state) {
    return
  }
  await RendererWorker.invoke('ComponentState.setState', componentUid, RemoveSchemaProperty.removeSchemaProperty(state))
}
