import { text, type VirtualDomNode, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { ComponentInfo } from '../ComponentInfo/ComponentInfo.ts'

const getCard = (component: ComponentInfo): readonly VirtualDomNode[] => {
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

export const getComponentStateVirtualDom = (components: readonly ComponentInfo[], loaded: boolean): readonly VirtualDomNode[] => {
  const description = loaded ? `${components.length} live components` : 'Loading live components…'
  return [
    {
      childCount: 3,
      className: 'ComponentStateView',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'ComponentStateHeading',
      type: VirtualDomElements.H2,
    },
    text('Live Component State'),
    {
      childCount: 1,
      className: 'ComponentStateDescription',
      type: VirtualDomElements.Div,
    },
    text(description),
    {
      childCount: components.length,
      className: 'ComponentStateGrid',
      type: VirtualDomElements.Div,
    },
    ...components.flatMap(getCard),
  ]
}
