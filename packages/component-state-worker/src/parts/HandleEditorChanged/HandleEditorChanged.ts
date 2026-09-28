import * as Assert from '@lvce-editor/assert'
import { EditorWorker, RendererWorker } from '@lvce-editor/rpc-registry'
import * as LiveComponentDomUri from '../LiveComponentDomUri/LiveComponentDomUri.ts'
import * as LiveComponentSavedStateUri from '../LiveComponentSavedStateUri/LiveComponentSavedStateUri.ts'
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

const applyEditorChanged = async (editorUid: number, uri: string): Promise<void> => {
  if (LiveComponentSavedStateUri.is(uri)) {
    return
  }
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

interface PendingChange {
  promise: Promise<void>
  rerun: boolean
  uri: string
}

const pendingChanges = new Map<number, PendingChange>()

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- shared pending work is updated by subsequent editor notifications
const applyPendingChanges = async (editorUid: number, pending: PendingChange): Promise<void> => {
  try {
    while (pending.rerun) {
      pending.rerun = false
      await applyEditorChanged(editorUid, pending.uri)
    }
  } finally {
    pendingChanges.delete(editorUid)
  }
}

export const handleEditorChanged = (editorUid: number, uri: string): Promise<void> => {
  const current = pendingChanges.get(editorUid)
  if (current) {
    current.uri = uri
    current.rerun = true
    return current.promise
  }
  const pending: PendingChange = { promise: Promise.resolve(), rerun: true, uri }
  pendingChanges.set(editorUid, pending)
  pending.promise = applyPendingChanges(editorUid, pending)
  return pending.promise
}
