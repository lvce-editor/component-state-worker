import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'

interface Dimensions {
  readonly height: number
  readonly width: number
  readonly x: number
  readonly y: number
}

export const resize = (state: ComponentStateViewState, dimensions: Dimensions): ComponentStateViewState => ({
  ...state,
  ...dimensions,
})
