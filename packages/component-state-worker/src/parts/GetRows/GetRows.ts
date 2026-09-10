import { type VirtualDomNode, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { ComponentInfo } from '../ComponentInfo/ComponentInfo.ts'
import * as ClassNames from '../ClassNames/ClassNames.ts'
import { getCard } from '../GetCard/GetCard.ts'

export const getRows = (components: readonly ComponentInfo[], columnCount: number): readonly VirtualDomNode[] => {
  const rows: ComponentInfo[][] = []
  for (let index = 0; index < components.length; index += columnCount) {
    rows.push(components.slice(index, index + columnCount))
  }
  return rows.flatMap((row) => [
    {
      childCount: row.length,
      className: ClassNames.Row,
      type: VirtualDomElements.Div,
    },
    ...row.flatMap(getCard),
  ])
}
