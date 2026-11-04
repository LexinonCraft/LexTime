import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from "eslint-plugin-simple-import-sort"
import unusedImports from "eslint-plugin-unused-imports"
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist', 'dev-dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports
    },
    rules: {
      "indent": ["error", 2],
      "no-unused-vars": "off", // or "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_",
        },
      ],
      "simple-import-sort/imports": [
        "error",
        {
          "groups": [
            // 1. Side effect imports at the start.
            ["^\\u0000"],
            // 2. `react` and packages: Things that start with a letter (or digit or underscore), or `@` followed by a letter.
            ["^react$", "^@?\\w"],
            // 3. Absolute imports and other imports such as Vue-style `@/foo`.
            // Anything not matched in another group. (also relative imports starting with "../")
            ["^@", "^"],
            // 4. relative imports from same folder "./"
            ["^\\./"],
            // 5. style module imports always come last, this helps to avoid CSS order issues
            ["^.+\\.(module.css|module.scss)$"],
            // 6. media imports
            ["^.+\\.(gif|png|svg|jpg)$"]
          ]
        }
      ],
      "react-refresh/only-export-components": "off"
    }
  }
])
