// commit-lint config
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // @see https://commitlint.js.org/#/reference-rules
    'type-enum': [
      2,
      'always',
      ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test', 'types'],
    ],
  },
};
