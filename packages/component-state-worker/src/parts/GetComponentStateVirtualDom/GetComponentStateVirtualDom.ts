import { text, type VirtualDomNode, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { ComponentInfo } from '../ComponentInfo/ComponentInfo.ts'
import * as ClassNames from '../ClassNames/ClassNames.ts'
import { getCard } from '../GetCard/GetCard.ts'
import { getColumnCount } from '../GetColumnCount/GetColumnCount.ts'

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

const getRows = (components: readonly ComponentInfo[], columnCount: number): readonly VirtualDomNode[] => {
  const rows: VirtualDomNode[] = []
  for (let index = 0; index < components.length; index += columnCount) {
    const row = components.slice(index, index + columnCount)
    rows.push(
      {
        childCount: row.length,
        className: ClassNames.Row,
        type: VirtualDomElements.Div,
      },
      ...row.flatMap(getCard),
    )
  }
  return rows
}

export const getComponentStateVirtualDom = (
  components: readonly ComponentInfo[],
  loaded: boolean,
  width: number,
): readonly VirtualDomNode[] => {
  const description = loaded ? `${components.length} live components` : 'Loading live components…'
  const columnCount = getColumnCount(width)
  const rowCount = Math.ceil(components.length / columnCount)
  return [
    viewNode,
    headingNode,
    text('Live Component State'),
    descriptionNode,
    text(description),
    {
      childCount: rowCount,
      className: ClassNames.Rows,
      type: VirtualDomElements.Div,
    },
    ...getRows(components, columnCount),
  ]
}
