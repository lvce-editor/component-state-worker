import * as Assert from '@lvce-editor/assert'
import { DirentType } from '@lvce-editor/constants'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import * as CreateStateSchema from '../CreateStateSchema/CreateStateSchema.ts'
import * as EditorChangeListener from '../EditorChangeListener/EditorChangeListener.ts'
import * as LiveComponentDomUri from '../LiveComponentDomUri/LiveComponentDomUri.ts'
import * as LiveComponentStateSchemaUri from '../LiveComponentStateSchemaUri/LiveComponentStateSchemaUri.ts'
import * as LiveComponentStateUri from '../LiveComponentStateUri/LiveComponentStateUri.ts'
import * as RemoveSchemaProperty from '../RemoveSchemaProperty/RemoveSchemaProperty.ts'

const getNormalizedState = async (uid: number): Promise<Record<string, unknown>> => {
  const state = await RendererWorker.invoke('ComponentState.getState', uid)
  const serializedState = JSON.stringify(state)
  return JSON.parse(serializedState)
}

export const readFile = async (uri: string): Promise<string> => {
  if (LiveComponentDomUri.is(uri)) {
    const dom = await RendererWorker.invoke('ComponentState.getDom', LiveComponentDomUri.getUid(uri))
    return `${JSON.stringify(dom, null, 2)}\n`
  }
  if (LiveComponentStateSchemaUri.is(uri)) {
    const uid = LiveComponentStateSchemaUri.getUid(uri)
    const state = await getNormalizedState(uid)
    const schema = CreateStateSchema.createStateSchema(state, uri)
    return `${JSON.stringify(schema, null, 2)}\n`
  }
  const uid = LiveComponentStateUri.getUid(uri)
  await EditorChangeListener.register()
  const state = RemoveSchemaProperty.removeSchemaProperty(await getNormalizedState(uid))
  const stateWithSchema = {
    $schema: LiveComponentStateSchemaUri.toUri(uid),
    ...state,
  }
  return `${JSON.stringify(stateWithSchema, null, 2)}\n`
}

export const writeFile = async (uri: string, content: string): Promise<void> => {
  const uid = LiveComponentStateUri.getUid(uri)
  const state: unknown = JSON.parse(content)
  Assert.object(state)
  const componentState = RemoveSchemaProperty.removeSchemaProperty(state as Record<string, unknown>)
  await RendererWorker.invoke('ComponentState.setState', uid, componentState)
}

export const readDirWithFileTypes = async (): Promise<readonly { readonly name: string; readonly type: number }[]> => {
  const components = await RendererWorker.getComponents()
  return components.filter((component) => component.editable).map((component) => ({ name: `${component.uid}.json`, type: DirentType.File }))
}

export const isReadonly = (uri = ''): boolean => LiveComponentStateSchemaUri.is(uri) || LiveComponentDomUri.is(uri)

export const exists = async (uri: string): Promise<boolean> => {
  const uriModule = [LiveComponentDomUri, LiveComponentStateSchemaUri].find((module) => module.is(uri)) || LiveComponentStateUri
  const uid = uriModule.getUid(uri)
  const components = await RendererWorker.getComponents()
  return components.some((component) => component.uid === uid && component.editable)
}

export const canBeRestored = true
