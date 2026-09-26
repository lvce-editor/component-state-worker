import { MenuItemFlags } from '@lvce-editor/constants'
import * as ComponentStateStrings from '../ComponentStateStrings/ComponentStateStrings.ts'

export const getMenuEntries = (
  _uid: number,
  {
    componentUid,
    domAvailable = true,
    heapSnapshotAvailable = false,
    savedStateAvailable = false,
  }: {
    readonly componentUid: number
    readonly domAvailable?: boolean
    readonly heapSnapshotAvailable?: boolean
    readonly savedStateAvailable?: boolean
  },
): readonly any[] => [
  {
    args: [componentUid],
    command: 'ComponentState.showSavedState',
    flags: savedStateAvailable ? MenuItemFlags.None : MenuItemFlags.Disabled,
    id: 'showSavedState',
    label: ComponentStateStrings.showSavedState(),
  },
  {
    args: [componentUid],
    command: 'ComponentState.showDom',
    flags: domAvailable ? MenuItemFlags.None : MenuItemFlags.Disabled,
    id: 'showDom',
    label: ComponentStateStrings.showDom(),
  },
  {
    args: [componentUid],
    command: 'ComponentState.showHeapSnapshot',
    flags: heapSnapshotAvailable ? MenuItemFlags.None : MenuItemFlags.Disabled,
    id: 'showHeapSnapshot',
    label: 'Show Heap Snapshot',
  },
]
