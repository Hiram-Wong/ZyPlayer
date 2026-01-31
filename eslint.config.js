import antfu from '@antfu/eslint-config';
import { globalIgnores } from 'eslint/config';
import prettier from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import vueCss from 'eslint-plugin-vue-scoped-css';
import globals from 'globals';
import typescript from 'typescript-eslint';

export default antfu(
  {
    typescript: true,
    vue: true,
    jsonc: false,
    yaml: false,
    markdown: false,
    formatters: false,
  },
  [
    ...vueCss.configs['flat/recommended'],
    prettier,
    {
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node,
          ...globals.jest,
          defineProps: 'readonly',
          defineEmits: 'readonly',
        },
        ecmaVersion: 6,
        sourceType: 'module',

        parserOptions: {
          parser: typescript.parser,
          allowImportExportEverywhere: true,

          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      plugins: {
        'simple-import-sort': simpleImportSort,
      },

      settings: {
        'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
      },

      rules: {
        /* Closed due to template running
         * (Recommended to open!)
         */
        'no-console': 'off',
        'ts/no-explicit-any': 'off',

        /* Disallow person rules */
        'antfu/top-level-function': 'off',
        'antfu/if-newline': 'off',
        'n/prefer-global/process': 'off',

        /* If you need control the imports sequence, must be off
         *  https://github.com/vuejs/vue-eslint-parser/issues/58
         */
        'import/first': 'off',

        /* Allow start with _ */
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          },
        ],
        'vue/no-unused-vars': [
          'error',
          {
            ignorePattern: '^_',
          },
        ],
        // Using ts/no-unused-vars instead
        'no-unused-vars': 'off',

        /* Some variables are initialized in the function */
        '@typescript-eslint/no-use-before-define': 'off',
        'no-use-before-define': 'off',

        /* Disable antfu sort, use simple sort import */
        'perfectionist/sort-imports': 'off',
        'perfectionist/sort-named-imports': 'off',
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        // Disable unused-imports rules in other presets
        'unused-imports/no-unused-imports': 'off',
        'unused-imports/no-unused-vars': 'off',
      },
    },
    {
      files: ['**/*.vue'],

      rules: {
        'vue/component-name-in-template-casing': ['error', 'kebab-case'],
        'vue/custom-event-name-casing': ['error', 'kebab-case'],
        'vue/block-order': [
          'error',
          {
            order: ['template', 'script', 'style'],
          },
        ],
        'vue/block-lang': [
          'error',
          {
            script: {
              lang: ['ts', 'tsx'],
            },
          },
        ],
        'vue/multi-word-component-names': 'off',
        'vue/no-reserved-props': 'off',
        'vue/no-v-html': 'off',

        'vue-scoped-css/no-parsing-error': 'off',
        'vue-scoped-css/no-unused-selector': 'off',
        'vue-scoped-css/enforce-style-type': [
          'error',
          {
            allows: ['scoped'],
          },
        ],
        'vue/padding-line-between-blocks': ['error', 'never'],
      },
    },
    globalIgnores([
      '**/snapshot*',
      '**/dist',
      '**/out',
      '**/lib',
      '**/es',
      '**/esm',
      '**/node_modules',
      '**/build',
      '**/*.min.js',
      '**/*.min.css',
      '**/*.toml',
      '**/*.py',
      '.yarn/**',
      '.gitignore',
      '!**/.prettierrc.js',
      'resources/t3Catopen/*.js',
    ]),
  ],
);
