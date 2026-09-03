import { defineConfig } from 'eslint/config'
import * as config from '@lvce-editor/eslint-config'

export default defineConfig([
  ...config.default,
  ...config.recommendedVirtualDom,
  ...config.recommendedVirtualDomStrict,
  ...config.recommendedRegex,
  ...config.recommendedTsconfig,
  ...config.recommendedActions,
  ...config.recommendedNvmrc,
  ...config.recommendedE2e,
  ...config.recommendedRpc,
  {
    rules: {
      '@cspell/spellchecker': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      'jest/no-restricted-jest-methods': 'off',
      'prefer-destructuring': 'off',
    },
  },
])
