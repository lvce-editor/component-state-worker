import { MenuItemFlags } from '@lvce-editor/constants'

export const getMenuEntries = (
  _uid: number,
  {
    componentUid,
    domAvailable = true,
    heapSnapshotAvailable = false,
  }: { readonly componentUid: number; readonly domAvailable?: boolean; readonly heapSnapshotAvailable?: boolean },
): readonly any[] => [
  {
    args: [componentUid],
    command: 'ComponentState.showDom',
    flags: domAvailable ? MenuItemFlags.None : MenuItemFlags.Disabled,
    id: 'showDom',
    label: 'Show Dom',
  },
  {
    args: [componentUid],
    command: 'ComponentState.showHeapSnapshot',
    flags: heapSnapshotAvailable ? MenuItemFlags.None : MenuItemFlags.Disabled,
    id: 'showHeapSnapshot',
    label: 'Show Heap Snapshot',
  },
]
