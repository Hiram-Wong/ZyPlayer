import { isJsonStr } from '@shared/modules/validate';
import JSON5 from 'json5';
import type { IDisposable } from 'monaco-editor';
import { version } from 'monaco-editor/package.json';
import semver from 'semver';

import type { IEditor, ILang } from '../code-editor-types';

const providerCache = new WeakMap<IEditor, Map<string, IDisposable>>();
const extraLibCache = new WeakMap<IEditor, Map<ILang, IDisposable>>();

const isNewMonaco = semver.gt(version, '0.52.2');

const resetCache = <T>(cache: Map<T, IDisposable>, key: T) => {
  cache.get(key)?.dispose();
  cache.delete(key);
};

const getCache = <K, V>(weakMap: WeakMap<IEditor, Map<K, V>>, ins: IEditor): Map<K, V> => {
  let cache = weakMap.get(ins);
  if (!cache) {
    cache = new Map<K, V>();
    weakMap.set(ins, cache);
  }
  return cache;
};

export const applymSuggestions = (monaco: IEditor, language: ILang, suggestions: any): void => {
  if (!suggestions) return;
  if (!['python', 'json', 'javascript', 'typescript'].includes(language)) return;

  const cache = getCache(providerCache, monaco);
  resetCache(cache, language);

  const disposable = monaco.languages.registerCompletionItemProvider(language, {
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);

      const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);

      const list = suggestions(range, monaco) ?? [];

      return {
        suggestions: list.map((item: any) => ({
          label: item.label,
          detail: item.detail,
          kind: item.kind ?? monaco.languages.CompletionItemKind.Function,
          insertText: item.insertText,
          insertTextRules: item.insertTextRules ?? monaco.languages.CompletionItemInsertTextRule.None,
          documentation: item.documentation,
          range,
        })),
      };
    },
  });

  cache.set(language, disposable);
};

export const applyExtraLib = (monaco: IEditor, language: ILang, extraLib: string) => {
  if (!extraLib) return;
  if (!['json', 'javascript', 'typescript'].includes(language)) return;

  const cache = getCache(extraLibCache, monaco);
  resetCache(cache, language);

  let disposable: IDisposable = { dispose: () => {} };

  if (language === 'javascript') {
    const filePath = `ts:extra/${language}/globals.d.ts`;

    if (isNewMonaco) {
      // @ts-expect-error new api
      monaco.typescript.javascriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true }); // disable errors
      // @ts-expect-error new api
      monaco.typescript.javascriptDefaults.setExtraLibs([{ content: extraLib, filePath }]);
    } else {
      // // @ts-expect-error deprecated api
      disposable = monaco.languages.typescript.javascriptDefaults.addExtraLib(extraLib, filePath);
    }
  }

  if (language === 'typescript') {
    const filePath = `ts:extra/${language}/globals.d.ts`;
    if (isNewMonaco) {
      // @ts-expect-error new api
      monaco.typescript.typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true }); // disable errors
      // @ts-expect-error new api
      monaco.typescript.typescriptDefaults.setExtraLibs([{ content: extraLib, filePath }]);
    } else {
      // // @ts-expect-error deprecated api
      disposable = monaco.languages.typescript.typescriptDefaults.addExtraLib(extraLib, filePath);
    }
  }

  if (language === 'json') {
    const schema = isJsonStr(extraLib) ? JSON5.parse(extraLib) : {};
    const filePath = `json:extra/${language}/schema.json`;

    if (isNewMonaco) {
      // @ts-expect-error new api
      monaco.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: false,
        enableSchemaRequest: true,
        schemas: [{ uri: filePath, fileMatch: ['*'], schema }],
      });
    } else {
      // // @ts-expect-error deprecated api
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: false,
        enableSchemaRequest: true,
        schemas: [{ uri: filePath, fileMatch: ['*'], schema }],
      });
    }
  }

  cache.set(language, disposable);
};
