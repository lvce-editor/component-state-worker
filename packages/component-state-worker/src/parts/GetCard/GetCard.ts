import { text, type VirtualDomNode, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { ComponentInfo } from '../ComponentInfo/ComponentInfo.ts'

export const getCard = (component: ComponentInfo): readonly VirtualDomNode[] => {
  const status = component.editable ? 'Open JSON state' : 'State API unavailable'
  return [
    {
      childCount: 3,
      className: 'ComponentStateCard',
      'data-uid': String(component.uid),
      disabled: !component.editable,
      onClick: 1,
      type: VirtualDomElements.Button,
    },
    {
      childCount: 1,
      className: 'ComponentStateCardTitle',
      type: VirtualDomElements.Strong,
    },
    text(component.moduleId),
    {
      childCount: 1,
      className: 'ComponentStateCardUid',
      type: VirtualDomElements.Span,
    },
    text(`uid ${component.uid}`),
    {
      childCount: 1,
      className: 'ComponentStateCardStatus',
      type: VirtualDomElements.Span,
    },
    text(status),
  ]
}
