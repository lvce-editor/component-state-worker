import { AriaRoles, mergeClassNames, text, type VirtualDomNode, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import * as ClassNames from '../ClassNames/ClassNames.ts'
import * as ComponentStateStrings from '../ComponentStateStrings/ComponentStateStrings.ts'
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
  childCount: 1,
  className: ClassNames.HeaderActions,
  role: AriaRoles.ToolBar,
  type: VirtualDomElements.Div,
}

const refreshButtonNode: VirtualDomNode = {
  childCount: 1,
  className: ClassNames.IconButton,
  onClick: DomEventListenerFunctions.HandleRefresh,
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
  text(ComponentStateStrings.liveComponentState()),
  { ...actionsNode, ariaLabel: ComponentStateStrings.liveComponentStateActions() },
  { ...refreshButtonNode, ariaLabel: ComponentStateStrings.refresh(), title: ComponentStateStrings.refresh() },
  refreshIconNode,
]
