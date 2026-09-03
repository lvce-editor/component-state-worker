import { text, type VirtualDomNode, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { ComponentInfo } from '../ComponentInfo/ComponentInfo.ts'
import * as ClassNames from '../ClassNames/ClassNames.ts'
import { getCard } from '../GetCard/GetCard.ts'

const viewNode: VirtualDomNode = {
  childCount: 3,
  className: ClassNames.View,
  type: VirtualDomElements.Div,
}

const headingNode: VirtualDomNode = {
  childCount: 1,
  className: ClassNames.Heading,
  type: VirtualDomElements.H2,
}

const descriptionNode: VirtualDomNode = {
  childCount: 1,
  className: ClassNames.Description,
  type: VirtualDomElements.Div,
}

export const getComponentStateVirtualDom = (components: readonly ComponentInfo[], loaded: boolean): readonly VirtualDomNode[] => {
  const description = loaded ? `${components.length} live components` : 'Loading live components…'
  return [
    viewNode,
    headingNode,
    text('Live Component State'),
    descriptionNode,
    text(description),
    {
      childCount: components.length,
      className: ClassNames.Grid,
      type: VirtualDomElements.Div,
    },
    ...components.flatMap(getCard),
  ]
}
