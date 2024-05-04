const createDependencyProposals = (range: object, monaco: any) => {
  let snippets = [
    {
      label: 'ifelse',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: [
        'if ${1:condition} {',
        '\t$0',
        '} else {',
        '\t',
        '}'
      ].join('\n'),
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'If-Else Statement',
      range: range
    },
    {
      label: '$js',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: [
        '\\$js.toString(()=>{',
        '$1',
        '})',
      ].join('\n'),
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: '$js工具',
      range: range
    },
  ];
  return snippets;
}

export { createDependencyProposals }
