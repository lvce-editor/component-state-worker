import { defineConfig } from 'eslint/config'
import * as config from '@lvce-editor/eslint-config'

export default defineConfig([
  ...config.default,
  ...config.recommendedVirtualDom,
  ...config.recommendedVirtualDomStrict,
  ...config.recommendedRegex,
  ...config.recommendedTsconfig,
  ...config.recommendedActions,
  ...config.recommendedNvmrc.map((nvmrcConfig) => ({
    ...nvmrcConfig,
    rules: {
      ...nvmrcConfig.rules,
      'nvmrc/valid-version': ['error', { maximumVersion: '26.12.0' }],
    },
  })),
  ...config.recommendedE2e,
  ...config.recommendedRpc,
  {
    rules: {
      '@cspell/spellchecker': 'off',
      'jest/no-restricted-jest-methods': 'off',
    },
  },
])
