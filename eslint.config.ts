import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'
import prettierConfig from 'eslint-config-prettier/flat'
import globals from 'globals'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // 'flat/essential' (correctness rules), not 'flat/recommended' — the
  // latter bundles template-formatting rules (attribute wrapping, line
  // breaks) that fight with Prettier. This matches what the official
  // create-vue tool ships with --eslint --prettier.
  ...vue.configs['flat/essential'],
  {
    files: ['**/*.vue'],
    languageOptions: { parser: vueParser, parserOptions: { parser: tseslint.parser } },
  },
  {
    // Root-level Node scripts and config files run outside any tsconfig's
    // "types": ["node"], so ESLint doesn't know about `process`, `__dirname`,
    // etc. here unless told explicitly.
    files: ['scripts/**/*.js', '*.config.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
  {
    // A config object with ONLY `ignores` (no `files`/`rules`) is a *global*
    // ignore in ESLint's flat config — it excludes these paths from every
    // config above, not just the rules block below. Combining `ignores` with
    // `rules` in one object (the previous shape here) only skipped that one
    // block's rules, so build output still got linted by the earlier
    // js/vue/typescript-eslint configs. Keep this as its own entry.
    ignores: ['**/dist/**', '**/node_modules/**', '**/public/**'],
  },
  {
    rules: {
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/define-macros-order': [
        'error',
        { order: ['defineOptions', 'defineProps', 'defineEmits'], defineExposeLast: true },
      ],
      'vue/no-unused-vars': 'error',
      'vue/require-default-prop': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'debug'] }],
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
    },
  },
  // Always last: turns off any remaining core/typescript-eslint stylistic
  // rules that would otherwise fight with Prettier.
  prettierConfig,
)
