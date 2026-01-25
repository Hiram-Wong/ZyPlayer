import './code-editor.less';

import type { SetupContext } from 'vue';
import { defineComponent } from 'vue';

import type { CodeEditorProps } from './code-editor-types';
import { codeEditorProps } from './code-editor-types';
import { useCodeEditor } from './composables/use-code-editor';

export default defineComponent({
  name: 'CodeEditor',
  props: codeEditorProps,
  emits: ['update:modelValue', 'update:originalValue', 'afterEditorInit', 'click', 'monacoObject'],
  setup(props: CodeEditorProps, ctx: SetupContext) {
    const { editorEl } = useCodeEditor(props, ctx);
    return () => <div ref={editorEl} class="code-editor"></div>;
  },
});
