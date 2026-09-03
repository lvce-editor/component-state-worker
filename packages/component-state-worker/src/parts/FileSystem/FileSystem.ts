import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ComponentInfo } from '../ComponentInfo/ComponentInfo.ts'
import * as LiveComponentStateUri from '../LiveComponentStateUri/LiveComponentStateUri.ts'

const assertObject: (value: unknown) => asserts value is Record<string, unknown> = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('Component state must be a JSON object')
  }
}

export const readFile = async (uri: string): Promise<string> => {
  const uid = LiveComponentStateUri.getUid(uri)
  const state = await RendererWorker.invoke('ComponentState.getState', uid)
  return `${JSON.stringify(state, null, 2)}\n`
}

export const writeFile = async (uri: string, content: string): Promise<void> => {
  const uid = LiveComponentStateUri.getUid(uri)
  const state: unknown = JSON.parse(content)
  assertObject(state)
  await RendererWorker.invoke('ComponentState.setState', uid, state)
}

export const readDirWithFileTypes = async (): Promise<readonly { readonly name: string; readonly type: number }[]> => {
  const components = (await RendererWorker.invoke('ComponentState.getComponents')) as readonly ComponentInfo[]
  return components.filter((component) => component.editable).map((component) => ({ name: `${component.uid}.json`, type: 1 }))
}

export const isReadonly = (): boolean => false

export const exists = async (uri: string): Promise<boolean> => {
  const uid = LiveComponentStateUri.getUid(uri)
  const components = (await RendererWorker.invoke('ComponentState.getComponents')) as readonly ComponentInfo[]
  return components.some((component) => component.uid === uid && component.editable)
}

export const canBeRestored = true
