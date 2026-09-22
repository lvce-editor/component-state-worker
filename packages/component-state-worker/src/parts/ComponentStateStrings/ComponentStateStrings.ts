import { i18nString } from '@lvce-editor/i18n'
import * as UiStrings from '../UiStrings/UiStrings.ts'

export const liveComponentState = (): string => {
  return i18nString(UiStrings.LiveComponentState)
}

export const liveComponentStateActions = (): string => {
  return i18nString(UiStrings.LiveComponentStateActions)
}

export const refresh = (): string => {
  return i18nString(UiStrings.Refresh)
}

export const openJsonState = (): string => {
  return i18nString(UiStrings.OpenJsonState)
}

export const stateApiUnavailable = (): string => {
  return i18nString(UiStrings.StateApiUnavailable)
}

export const uid = (value: number): string => {
  return i18nString(UiStrings.Uid, { PH1: value })
}

export const liveComponents = (value: number): string => {
  return i18nString(UiStrings.LiveComponents, { PH1: value })
}

export const loadingLiveComponents = (): string => {
  return i18nString(UiStrings.LoadingLiveComponents)
}

export const showDom = (): string => {
  return i18nString(UiStrings.ShowDom)
}
