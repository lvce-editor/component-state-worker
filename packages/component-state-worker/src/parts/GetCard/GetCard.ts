import { text, type VirtualDomNode, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { ComponentInfo } from '../ComponentInfo/ComponentInfo.ts'
import * as ClassNames from '../ClassNames/ClassNames.ts'
import * as ComponentStateStrings from '../ComponentStateStrings/ComponentStateStrings.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'

const titleNode: VirtualDomNode = {
  childCount: 1,
  className: ClassNames.CardTitle,
  type: VirtualDomElements.Strong,
}

const uidNode: VirtualDomNode = {
  childCount: 1,
  className: ClassNames.CardUid,
  type: VirtualDomElements.Span,
}

const statusNode: VirtualDomNode = {
  childCount: 1,
  className: ClassNames.CardStatus,
  type: VirtualDomElements.Span,
}

export const getCard = (component: ComponentInfo): readonly VirtualDomNode[] => {
  let status = ComponentStateStrings.stateApiUnavailable()
  if (component.editable) {
    status = ComponentStateStrings.openJsonState()
  } else if (component.savedStateAvailable) {
    status = ComponentStateStrings.savedStateAvailable()
  }
  const uid =
    typeof component.stateSize === 'number'
      ? ComponentStateStrings.uidWithSize(component.uid, component.stateSize)
      : ComponentStateStrings.uid(component.uid)
  return [
    {
      childCount: 3,
      className: ClassNames.Card,
      'data-uid': String(component.uid),
      disabled: !component.editable && !component.savedStateAvailable,
      draggable: component.editable,
      onClick: DomEventListenerFunctions.HandleClick,
      onContextMenu: DomEventListenerFunctions.HandleContextMenu,
      onDragStart: DomEventListenerFunctions.HandleDragStart,
      onPointerDown: DomEventListenerFunctions.HandlePointerDown,
      type: VirtualDomElements.Button,
    },
    titleNode,
    text(component.displayName || component.moduleId),
    uidNode,
    text(uid),
    statusNode,
    text(status),
  ]
}
