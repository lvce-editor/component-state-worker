import { AriaRoles, mergeClassNames, text, type VirtualDomNode, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import * as ClassNames from '../ClassNames/ClassNames.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'

const headerNode: VirtualDomNode = {
  childCount: 2,
  className: ClassNames.Header,
  type: VirtualDomElements.Div,
}

const headingNode: VirtualDomNode = {
  childCount: 1,
  className: ClassNames.Heading,
  type: VirtualDomElements.H2,
}

const actionsNode: VirtualDomNode = {
  ariaLabel: 'Live Component State actions',
  childCount: 1,
  className: ClassNames.HeaderActions,
  role: AriaRoles.ToolBar,
  type: VirtualDomElements.Div,
}

const refreshButtonNode: VirtualDomNode = {
  ariaLabel: 'Refresh',
  childCount: 1,
  className: ClassNames.IconButton,
  onClick: DomEventListenerFunctions.HandleRefresh,
  title: 'Refresh',
  type: VirtualDomElements.Button,
}

const refreshIconNode: VirtualDomNode = {
  childCount: 0,
  className: mergeClassNames(ClassNames.MaskIcon, ClassNames.MaskIconRefresh),
  type: VirtualDomElements.Div,
}

export const getHeader = (): readonly VirtualDomNode[] => [
  headerNode,
  headingNode,
  text('Live Component State'),
  actionsNode,
  refreshButtonNode,
  refreshIconNode,
]
