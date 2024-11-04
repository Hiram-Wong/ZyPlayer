import { ExtractPropTypes, PropType, Ref } from 'vue';

export type Mode = 'normal' | 'diff' | 'review';
export type Theme = 'light' | 'dark';

export interface Decoration {
  lineNumber: number;
  icon?: string;
  customClasses?: string;
  glyphClassName?: string;
}
export interface Comment {
  lineNumber: number;
  isExpanded: boolean;
  domNode?: HTMLElement;
  heightInPx?: number;
  allowEditorOverflow?: boolean;
  offsetLeft?: number;
}

export const codeEditorProps = {
  modelValue: {
    type: String,
    default: '',
  },
  mode: {
    type: String as PropType<Mode>,
    default: 'normal',
  },
  originalText: {
    type: String,
    default: '',
  },
  theme: {
    type: String as PropType<Theme>,
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
    type: Array as PropType<Decoration[]>,
    default: () => [],
  },
  comments: {
    type: Array as PropType<Comment[]>,
    default: () => [],
  },
};

export type CodeEditorProps = ExtractPropTypes<typeof codeEditorProps>;

export interface UseCodeEditor {
  editorEl: Ref;
}

export interface PositionInfo {
  top?: number;
  height?: number;
}

export interface LayoutInfo extends PositionInfo {
  minimapWidth?: number;
  offsetLeft?: number;
}
