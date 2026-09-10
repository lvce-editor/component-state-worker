import type { ComponentStateViewState } from '../ComponentStateViewState/ComponentStateViewState.ts'

export const renderDragData = (newState: ComponentStateViewState): readonly any[] => {
  const { dragUri, uid } = newState
  const items = dragUri
    ? [
        { data: dragUri, type: 'text/uri-list' },
        { data: dragUri, type: 'text/plain' },
      ]
    : []
  return ['Viewlet.setDragData', uid, { items }]
}
