<template>
	<div class="ffmpeg-caption-dialog-container dialog-container-padding">
		<t-dialog v-model:visible="formVisible"
      :close-btn="false"
      :header="false"
      confirm-btn="安装检测"
      cancel-btn="知道了"
      :on-confirm="confirmEvent"
      placement="center"
      width="480px"
		>
			<template #body>
				<div class="ffmpeg-caption">
          <div class="header">缩略图使用说明</div>
          <div class="main-content">
            <MdPreview 
              editorId="privacy-policy"
              :modelValue="text"
              previewTheme="vuepress"
              :theme="theme"
            />
          </div>
        </div>
			</template>
		</t-dialog>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import 'md-editor-v3/lib/style.css';
import { MdPreview } from 'md-editor-v3';

import { useSettingStore } from '@/store';
import md from '@/assets/md/thumbnail-ffmpeg.md?raw';

const props = defineProps({
	visible: {
		type: Boolean,
		default: false,
	},
	data: {
		type: Object,
		default: () => {
			return {
				data: [],
				type: '',
			};
		},
	},
});

const formVisible = ref(false);
const formData = ref(props.data);
const text = ref(md);
const storeSetting = useSettingStore();
const theme = computed(() => {
  return storeSetting.displayMode;
});

const emit = defineEmits(['update:visible', 'receiveClassData']);

watch(
	() => formVisible.value,
	(val) => {
		emit('update:visible', val);
	},
);
watch(
	() => props.visible,
	(val) => {
		formVisible.value = val;
	},
);
watch(
	() => props.data,
	(val) => {
		formData.value = val;
	},
);

const confirmEvent = () => {
  window.electron.ipcRenderer.invoke('ffmpeg-installed-check').then(status => {
    if (status) MessagePlugin.success(`检测到ffmpeg模块已安装`);
		else MessagePlugin.error(`未检测到ffmpeg模块`);
  });
};
</script>

<style lang="less" scoped>
.ffmpeg-caption-dialog-container {
  :deep(.t-dialog) {
    .t-dialog__footer {
      display: flex;
      justify-content: space-around;
			padding: 0 !important;
      .t-button {
        width: 180px;
        height: 45px;
        border-radius: 25px;
        font-weight: 700;
        font-size: 15px;
        line-height: 45px;
      }
    }
  }
  .ffmpeg-caption {
    opacity: 1;
    .header {
      margin-top: 45px;
      font-weight: 700;
      font-size: 28px;
      text-align: center;
    }
    .main-content {
      height: 220px;
      margin: 35px auto 40px;
      overflow-x: hidden;
      overflow-y: scroll;
    }
  }
  :deep(.md-editor-preview-wrapper) {
    padding: 0;
    .md-editor-preview {
      color: var(--td-text-color-primary);
      blockquote {
        margin: 0;
      }
      p, li {
        font-weight: 500;
        font-size: 14px;
        line-height: 22px;
      }
    }
  }
}
</style>
