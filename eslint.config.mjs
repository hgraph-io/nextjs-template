import nextPlugin from 'eslint-config-next'

const eslintConfig = [
  ...nextPlugin,
  {
    ignores: [
      'node_modules/',
      '.next/',
      'out/',
      'build/',
      'dist/',
      '.cache/',
      '.turbo/',
      'next-env.d.ts',
      'coverage/',
    ],
  },
]

export default eslintConfig
