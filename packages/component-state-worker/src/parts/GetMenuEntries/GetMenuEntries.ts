import { MenuItemFlags } from '@lvce-editor/constants'

export const getMenuEntries = (_uid: number, { componentUid }: { readonly componentUid: number }): readonly any[] => [
  {
    args: [componentUid],
    command: 'ComponentState.showDom',
    flags: MenuItemFlags.None,
    id: 'showDom',
    label: 'Show Dom',
  },
]
