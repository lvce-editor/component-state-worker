import { type VirtualDomNode, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { ComponentInfo } from '../ComponentInfo/ComponentInfo.ts'
import * as ClassNames from '../ClassNames/ClassNames.ts'
import { getCard } from '../GetCard/GetCard.ts'

export const getRows = (components: readonly ComponentInfo[], columnCount: number): readonly VirtualDomNode[] => {
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
