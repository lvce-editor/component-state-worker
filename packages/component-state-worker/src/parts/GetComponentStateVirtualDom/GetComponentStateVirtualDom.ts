import { text, type VirtualDomNode, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { ComponentInfo } from '../ComponentInfo/ComponentInfo.ts'
import * as ClassNames from '../ClassNames/ClassNames.ts'
import { getColumnCount } from '../GetColumnCount/GetColumnCount.ts'
import { getHeader } from '../GetHeader/GetHeader.ts'
import { getRows } from '../GetRows/GetRows.ts'

const viewNode: VirtualDomNode = {
  childCount: 3,
  className: ClassNames.View,
  type: VirtualDomElements.Div,
}

const descriptionNode: VirtualDomNode = {
  childCount: 1,
  className: ClassNames.Description,
  type: VirtualDomElements.Div,
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
    ...getHeader(),
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
