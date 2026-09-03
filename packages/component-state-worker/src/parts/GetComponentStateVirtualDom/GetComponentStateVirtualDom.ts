import { text, type VirtualDomNode, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { ComponentInfo } from '../ComponentInfo/ComponentInfo.ts'
import { getCard } from '../GetCard/GetCard.ts'

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
