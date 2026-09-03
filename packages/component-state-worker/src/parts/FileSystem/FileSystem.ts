import * as Assert from '@lvce-editor/assert'
import { DirentType } from '@lvce-editor/constants'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ComponentInfo } from '../ComponentInfo/ComponentInfo.ts'
import * as LiveComponentStateUri from '../LiveComponentStateUri/LiveComponentStateUri.ts'

export const readFile = async (uri: string): Promise<string> => {
  const uid = LiveComponentStateUri.getUid(uri)
  const state = await RendererWorker.invoke('ComponentState.getState', uid)
  return `${JSON.stringify(state, null, 2)}\n`
}

export const writeFile = async (uri: string, content: string): Promise<void> => {
  const uid = LiveComponentStateUri.getUid(uri)
  const state: unknown = JSON.parse(content)
  Assert.object(state)
  await RendererWorker.invoke('ComponentState.setState', uid, state)
}

export const readDirWithFileTypes = async (): Promise<readonly { readonly name: string; readonly type: number }[]> => {
  const components = (await RendererWorker.invoke('ComponentState.getComponents')) as readonly ComponentInfo[]
  return components.filter((component) => component.editable).map((component) => ({ name: `${component.uid}.json`, type: DirentType.File }))
}

export const isReadonly = (): boolean => false

export const exists = async (uri: string): Promise<boolean> => {
  const uid = LiveComponentStateUri.getUid(uri)
  const components = (await RendererWorker.invoke('ComponentState.getComponents')) as readonly ComponentInfo[]
  return components.some((component) => component.uid === uid && component.editable)
}

export const canBeRestored = true
