export class InvalidLiveComponentStateUriError extends Error {
  readonly code = 'E_INVALID_LIVE_COMPONENT_STATE_URI'

  constructor(uri: string) {
    super(`Invalid live component state URI: ${uri}`)
    this.name = 'InvalidLiveComponentStateUriError'
  }
}
