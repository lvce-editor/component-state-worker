import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'

export const renderEventListeners = (): readonly any[] => [
  {
    name: DomEventListenerFunctions.HandleClick,
    params: ['handleClick', 'event.currentTarget.dataset.uid'],
    preventDefault: true,
  },
  {
    name: DomEventListenerFunctions.HandleRefresh,
    params: ['refresh'],
    preventDefault: true,
  },
  {
    name: DomEventListenerFunctions.HandleContextMenu,
    params: ['handleContextMenu', 'event.currentTarget.dataset.uid', 'event.clientX', 'event.clientY'],
    preventDefault: true,
  },
]
