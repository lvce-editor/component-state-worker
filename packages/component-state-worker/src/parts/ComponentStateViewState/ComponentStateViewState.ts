import type { ComponentInfo } from '../ComponentInfo/ComponentInfo.ts'

export interface ComponentStateViewState {
  readonly components: readonly ComponentInfo[]
  readonly dragUri: string
  readonly height: number
  readonly loaded: boolean
  readonly uid: number
  readonly width: number
  readonly x: number
  readonly y: number
}
