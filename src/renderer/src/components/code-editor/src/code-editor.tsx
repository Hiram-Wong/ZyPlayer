import { defineComponent } from 'vue';
import type { SetupContext } from 'vue';
import { codeEditorProps, CodeEditorProps } from './code-editor-types';
import { useCodeEditor } from './composables/use-code-editor';
import './code-editor.less';

export default defineComponent({
  name: 'CodeEditor',
  props: codeEditorProps,
  emits: ['update:modelValue', 'afterEditorInit', 'click', 'monacoObject'],
  setup(props: CodeEditorProps, ctx: SetupContext) {
    const { editorEl } = useCodeEditor(props, ctx);
    return () => <div ref={editorEl} class="code-editor"></div>;
  }
});
