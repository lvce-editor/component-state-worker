import { text, type VirtualDomNode, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { ComponentInfo } from '../ComponentInfo/ComponentInfo.ts'
import * as ClassNames from '../ClassNames/ClassNames.ts'
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
  const status = component.editable ? 'Open JSON state' : 'State API unavailable'
  return [
    {
      childCount: 3,
      className: ClassNames.Card,
      'data-uid': String(component.uid),
      disabled: !component.editable,
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    titleNode,
    text(component.moduleId),
    uidNode,
    text(`uid ${component.uid}`),
    statusNode,
    text(status),
  ]
}
