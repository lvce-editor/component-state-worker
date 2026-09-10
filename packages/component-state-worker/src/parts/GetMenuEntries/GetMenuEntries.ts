import { MenuItemFlags } from '@lvce-editor/constants'
import * as ComponentStateStrings from '../ComponentStateStrings/ComponentStateStrings.ts'

export const getMenuEntries = (
  _uid: number,
  { componentUid, domAvailable = true }: { readonly componentUid: number; readonly domAvailable?: boolean },
): readonly any[] => [
  {
    args: [componentUid],
    command: 'ComponentState.showDom',
    flags: domAvailable ? MenuItemFlags.None : MenuItemFlags.Disabled,
    id: 'showDom',
    label: ComponentStateStrings.showDom(),
  },
]
