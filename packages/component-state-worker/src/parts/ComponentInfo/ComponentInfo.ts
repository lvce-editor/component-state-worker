export interface ComponentInfo {
  readonly displayName: string
  readonly domAvailable: boolean
  readonly editable: boolean
  readonly heapSnapshotAvailable?: boolean
  readonly moduleId: string
  readonly uid: number
}
