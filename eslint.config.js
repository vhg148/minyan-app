import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: 'detect' } },
    plugins: { react },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // no-unused-vars לא רואה שימוש בתוך JSX; בלי זה כל רכיב מיובא נראה מיותר
      'react/jsx-uses-vars': 'error',
      // ESLint לא יוצר reference ל-<Foo />, אז no-undef לא תופס רכיב שלא יובא.
      // בלי הכלל הזה שגיאה כזו עוברת גם lint וגם build, ומתפוצצת רק בדפדפן.
      'react/jsx-no-undef': 'error',
    },
  },
])
