import type * as monaco from 'monaco-editor/esm/vs/editor/editor.api.d.ts';
import type { ExtractPropTypes, PropType, Ref } from 'vue';

export type IEditor = typeof import('monaco-editor');

export type IMode = 'normal' | 'diff' | 'review';
export type ITheme = 'light' | 'dark';
export type ILang = 'python' | 'json' | 'yaml' | 'javascript' | 'typescript' | 'plaintext';

export interface IEditorOptions {
  diff: monaco.editor.IStandaloneDiffEditorConstructionOptions;
  normal: monaco.editor.IStandaloneEditorConstructionOptions;
}

export interface IDecoration {
  lineNumber: number;
  icon?: string;
  customClasses?: string;
  glyphClassName?: string;
}
export interface IComment {
  lineNumber: number;
  isExpanded: boolean;
  domNode?: HTMLElement;
  heightInPx?: number;
  allowEditorOverflow?: boolean;
  offsetLeft?: number;
}

export interface IUseCodeEditor {
  editorEl: Ref;
}

export interface IPositionInfo {
  top?: number;
  height?: number;
}

export interface ILayoutInfo extends IPositionInfo {
  minimapWidth?: number;
  offsetLeft?: number;
}

export const codeEditorProps = {
  modelValue: {
    type: String,
    default: '',
  },
  originalValue: {
    type: String,
    default: '',
  },
  mode: {
    type: String as PropType<IMode>,
    default: 'normal',
  },
  theme: {
    type: String as PropType<ITheme>,
    default: 'light',
  },
  autoHeight: {
    type: Boolean,
    default: false,
  },
  refreshAll: {
    type: Boolean,
    default: false,
  },
  offsetLeft: {
    type: Number,
  },
  addCommentIcon: {
    type: String,
    default: '',
  },
  expandCommentIcon: {
    type: String,
    default: '',
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  mouseTargetTypes: {
    type: Array as PropType<number[]>,
    default: () => [2, 4],
  },
  editorDecorations: {
    type: Array as PropType<IDecoration[]>,
    default: () => [],
  },
  comments: {
    type: Array as PropType<IComment[]>,
    default: () => [],
  },
};

export type CodeEditorProps = ExtractPropTypes<typeof codeEditorProps>;
