import throttle from 'lodash/throttle';
import { onBeforeMount, onMounted, ref, SetupContext, toRefs, nextTick, watch } from 'vue';
import * as monacoModule from 'monaco-editor';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import { CodeEditorProps, Comment, Decoration, LayoutInfo, PositionInfo } from '../code-editor-types';

export function useCodeEditor(props: CodeEditorProps, ctx: SetupContext) {
  const editorEl = ref();
  const {
    modelValue,
    originalText,
    options,
    mode,
    autoHeight,
    offsetLeft,
    refreshAll,
    mouseTargetTypes,
    editorDecorations,
    comments,
    addCommentIcon,
    expandCommentIcon,
  } = toRefs(props);

  let monaco: any;
  let editor: any;
  let diffEditor: any;
  let commentViewZones: Array<{ lineNumber: number; id: string }> = [];
  let heightMap: Map<number, number> = new Map();
  let commentWidgets: Array<{ lineNumber: number; widget: any }> = [];
  let currentDecorations: string[] = [];
  let currentLineDecoration: string[] = [];
  let modifyValueFromInner = false;

  watch(editorDecorations, refreshDecorations, { deep: true });
  watch(
    comments,
    () => {
      refreshViewZones();
      refreshOverlayWidgets();
    },
    { deep: true },
  );
  watch(
    options,
    () => {
      updateLanguage();
      updateOptions();
    },
    { deep: true },
  );
  watch(originalText, setDiffEditorOriginValue);
  watch(modelValue, () => {
    if (!modifyValueFromInner) {
      setValue();
    } else {
      modifyValueFromInner = false;
    }
  });

  onBeforeMount(() => {});

  onMounted(async () => {
    if (typeof window !== 'undefined') {
      monaco = monacoModule;
      self.MonacoEnvironment = {
        getWorker(_: any, label: string) {
          if (label === 'json') {
            return new jsonWorker();
          }
          if (['css', 'scss', 'less'].includes(label)) {
            return new cssWorker();
          }
          if (['html', 'handlebars', 'razor'].includes(label)) {
            return new htmlWorker();
          }
          if (['typescript', 'javascript'].includes(label)) {
            return new tsWorker();
          }
          return new EditorWorker();
        },
      };
      init();
      if (mode.value === 'review') {
        nextTick(() => {
          refreshDecorations();
          refreshViewZones();
          refreshOverlayWidgets();
        });
      }
    }
  });

  function init(): void {
    if (mode.value === 'normal' || mode.value === 'review') {
      initNormalEditor();
    } else if (mode.value.includes('diff')) {
      initDiffEditor();
    }

    if (!options.value['theme']) {
      monaco.editor.setTheme('vs');
    }

    handleAutoHeight();
    setValueEmitter();
  }

  function initNormalEditor(): void {
    if (!editor) {
      editor = monaco.editor.create(editorEl.value, options.value);
      editor.setModel(monaco.editor.createModel(modelValue.value, options.value['language']));
      editor.addAction({
        id: "editor.action.clipboardPasteAction",
        label: "PasteCustom",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV],
        contextMenuGroupId: "9_cutcopypaste",
        contextMenuOrder: 1.5,
        run: async (editor) => {
          const text = await navigator.clipboard.readText();
          const selection = editor.getSelection();
          const op = {
            identifier: { major: 1, minor: 1 },
            range: selection,
            text: text,
            forceMoveMarkers: true,
          };
          editor.executeEdits("customPaste", [op]);
        },
      });
      ctx.emit('afterEditorInit', editor);
      ctx.emit('monacoObject', monaco);

      if (mode.value === 'review') {
        editor.onMouseMove(handleMouseMove);
        editor.onMouseLeave(handleMouseLeave);
        editor.onMouseDown(handleMouseDown);
      }
    }
  }

  function initDiffEditor(): void {
    if (!diffEditor) {
      diffEditor = monaco.editor.createDiffEditor(editorEl.value, options.value);
      diffEditor.setModel({
        original: monaco.editor.createModel(originalText.value, options.value['language']),
        modified: monaco.editor.createModel(modelValue.value, options.value['language']),
      });

      const originalEditor = diffEditor.getOriginalEditor();
      const modifiedEditor = diffEditor.getModifiedEditor();
      [originalEditor, modifiedEditor].forEach((item) => {
        item.addAction({
          id: "editor.action.clipboardPasteAction",
          label: "PasteCustom",
          keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV],
          contextMenuGroupId: "9_cutcopypaste",
          contextMenuOrder: 1.5,
          run: async (editor) => {
            const text = await navigator.clipboard.readText();
            const selection = editor.getSelection();
            const op = {
              identifier: { major: 1, minor: 1 },
              range: selection,
              text: text,
              forceMoveMarkers: true,
            };
            editor.executeEdits("customPaste", [op]);
          },
        });
      });
      ctx.emit('afterEditorInit', diffEditor);
      ctx.emit('monacoObject', monaco);
    }
  }

  function setValue() {
    if (mode.value === 'normal' || mode.value === 'review') {
      setEditorValue();
    } else if (mode.value === 'diff') {
      setDiffEditorValue();
    }
  }

  function setEditorValue() {
    if (!editor || !editor.getModel()) {
      return;
    }
    editor.getModel().setValue(modelValue.value);
  }

  function setDiffEditorValue() {
    if (!diffEditor || !diffEditor.getModel()) {
      return;
    }
    diffEditor.getModel().modified?.setValue(modelValue.value);
  }

  function handleAutoHeight(): void {
    if (autoHeight.value) {
      editor.onDidChangeModelDecorations(() => {
        setTimeout(updateEditorHeightAuto);
      });
    }
  }

  function setValueEmitter(): void {
    let model;
    if (editor) {
      model = editor.getModel();
    } else if (diffEditor) {
      model = diffEditor.getModel().modified;
    }

    model?.onDidChangeContent(
      throttle(() => {
        const editorValue = model.getValue();
        if (modelValue.value !== editorValue) {
          modifyValueFromInner = true;
          ctx.emit('update:modelValue', model.getValue());
        }
      }, 100),
    );
  }

  function setDiffEditorOriginValue(): void {
    if (!diffEditor || !diffEditor.getModel()) {
      return;
    }

    diffEditor.getModel().original?.setValue(originalText.value);
  }

  function updateLanguage() {
    const language = options.value.language;
    if (editor) {
      if (mode.value === 'normal' || mode.value === 'review') {
        monaco.editor.setModelLanguage(editor.getModel(), language);
      } else if (mode.value === 'diff') {
        const model = diffEditor.getModel();
        monaco.editor.setModelLanguage(model.modified, language);
        monaco.editor.setModelLanguage(model.original, language);
      }
    }
  }

  function updateOptions() {
    if (editor) {
      editor.updateOptions({ ...options.value });
    }
    if (diffEditor) {
      diffEditor.updateOptions({ ...options.value });
    }
  }

  function updateEditorHeightAuto(): void {
    const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight);
    const lineCount = editor.getModel()?.getLineCount() || 1;
    const height = editor.getTopForLineNumber(lineCount + 1) + lineHeight;

    if (editorEl.value) {
      editorEl.value.style.height = `${height}px`;
    }
    editor.layout();
  }

  function handleMouseMove(event: any): void {
    if (event.target && event.target.position) {
      const currentLineNumber = event.target.position.lineNumber;
      if (!isDecorationExisted(currentLineNumber)) {
        const lineDecoration: any[] = [
          {
            range: new monaco.Range(currentLineNumber, 0, currentLineNumber, 0),
            options: {
              isWholeLine: true,
              glyphMarginClassName: `icon-pointer ${addCommentIcon.value}`,
            },
          },
        ];
        currentLineDecoration = editor.deltaDecorations(currentLineDecoration, lineDecoration);
      } else {
        currentLineDecoration = editor.deltaDecorations(currentLineDecoration, []);
      }
    }
  }

  function handleMouseLeave(): void {
    editor.deltaDecorations(currentLineDecoration, []);
  }

  function handleMouseDown(event: any) {
    if (mouseTargetTypes.value.includes(event.target.type)) {
      ctx.emit('click', event);
    }
  }

  function refreshDecorations() {
    if (editorDecorations.value.length >= 0 && editor) {
      const tempDecorations = editorDecorations.value.map(setDecorations);
      setTimeout(() => {
        currentDecorations = editor.deltaDecorations(currentDecorations, tempDecorations);
      });
      currentLineDecoration = editor.deltaDecorations(currentLineDecoration, []);
    }
  }

  function setDecorations(decoration: Decoration): any {
    return {
      range: new monaco.Range(decoration.lineNumber, 1, decoration.lineNumber, 1),
      options: {
        isWholeLine: true,
        className: decoration.customClasses || '',
        glyphMarginClassName: `icon-pointer ${decoration.icon || expandCommentIcon.value} ${decoration.glyphClassName || ''}`,
      },
    };
  }

  function isDecorationExisted(lineNumber: number): boolean {
    return editorDecorations.value.some((ed) => ed.lineNumber === lineNumber);
  }

  function refreshViewZones(): void {
    if (editor) {
      editor.changeViewZones((changeAccessor: any) => {
        resetViewZones(changeAccessor);
        renderViewZones(changeAccessor);
        if (autoHeight.value) {
          updateEditorHeightAuto();
        }
      });
    }
  }

  function resetViewZones(changeAccessor: any): void {
    if (commentViewZones.length > 0) {
      commentViewZones.forEach((commentId) => {
        changeAccessor.removeZone(commentId.id);
      });
      commentViewZones = [];
      heightMap = new Map();
    }
  }

  function renderViewZones(changeAccessor: any): void {
    if (comments.value && comments.value.length) {
      const renderedComments = comments.value.filter((comment) => comment.isExpanded);
      renderedComments.forEach((comment) => {
        const commentId = changeAccessor.addZone({
          afterLineNumber: comment.lineNumber,
          heightInPx: comment.heightInPx ? comment.heightInPx : 0,
          afterColumn: 1,
          domNode: document.createElement('div'),
          onDomNodeTop: (top: number) => {
            layoutOverlayWidget(comment.lineNumber, { top });
          },
          onComputedHeight: (height: number) => {
            layoutOverlayWidget(comment.lineNumber, { height });
          },
        });
        commentViewZones.push({ lineNumber: comment.lineNumber, id: commentId });
      });
    }
  }

  function layoutOverlayWidget(lineNumber: number, ...positionInfos: PositionInfo[]): void {
    const index = comments.value.findIndex((comment) => comment.lineNumber === lineNumber);
    const editorLayoutInfo = editor.getLayoutInfo();
    const layoutInfo: LayoutInfo = calculateLayoutInfo(positionInfos, editorLayoutInfo, index);
    if (layoutInfo.height) {
      heightMap.set(index, layoutInfo.height);
    }

    comments.value[index].domNode!.style.width =
      `${editorLayoutInfo.width - layoutInfo.minimapWidth! - layoutInfo.offsetLeft!}px`;
    handleDomNodePosition(layoutInfo.top!, layoutInfo.height!, index);
  }

  function calculateLayoutInfo(positionInfos: PositionInfo[], editorLayoutInfo: any, index: number): LayoutInfo {
    let _offsetLeft = 0;
    const indexOffsetLeft = comments.value[index].offsetLeft;
    if (indexOffsetLeft) {
      _offsetLeft = indexOffsetLeft;
    } else {
      _offsetLeft = offsetLeft?.value ? offsetLeft?.value : 0;
    }
    return {
      top: positionInfos[0].top,
      height: positionInfos[0].height,
      minimapWidth: editorLayoutInfo.minimap.minimapWidth,
      offsetLeft: _offsetLeft,
    };
  }

  function handleDomNodePosition(top: number, height: number, index: number): void {
    comments.value[index].domNode!.style.height = `${height}px`;
    if (heightMap.get(index) === 0) {
      comments.value[index].domNode!.style.top = `-${10000 + top}px`;
    } else {
      comments.value[index].domNode!.style.top = `${top}px`;
    }
  }

  function refreshOverlayWidgets(): void {
    if (editor) {
      renderOverlayWidget();
    }
  }

  function renderOverlayWidget(): void {
    // 切换新文件时要移除editor上原有的所有评论
    if (refreshAll.value) {
      resetAllOverlayWidget();
    } else {
      resetOverlayWidget();
    }
    const renderedWidget = comments.value.filter((comment) => comment.isExpanded);
    renderedWidget?.forEach((comment) => {
      const commentIndex = commentWidgets.findIndex((cw) => cw.lineNumber === comment.lineNumber);
      if (commentIndex === -1) {
        const overlayWidget = buildOverlayWidget(comment);
        commentWidgets.push({ lineNumber: comment.lineNumber, widget: overlayWidget });
        editor.addOverlayWidget(overlayWidget);
      }
    });
  }

  function resetOverlayWidget(): void {
    comments.value.forEach((comment) => {
      if (!comment.isExpanded) {
        const commentIndex = commentWidgets.findIndex((cw) => cw.lineNumber === comment.lineNumber);
        if (commentIndex !== -1) {
          const commentRemoved = commentWidgets.splice(commentIndex, 1)[0];
          editor.removeOverlayWidget(commentRemoved.widget);
        }
      }
    });
  }

  function resetAllOverlayWidget(): void {
    if (commentWidgets.length > 0) {
      commentWidgets.forEach((widget) => {
        editor.removeOverlayWidget(widget.widget);
      });
      commentWidgets = [];
    }
  }

  function buildOverlayWidget(comment: Comment): any {
    return {
      getId: () => {
        return `widget-lineNumber${comment.lineNumber}`;
      },
      getDomNode: () => {
        return comment.domNode;
      },
      getPosition: () => {
        return null;
      },
    };
  }

  return { editorEl };
}
