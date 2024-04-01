<template>
	<div class="custtom-player-dialog-container dialog-container-padding">
		<t-dialog v-model:visible="formVisible"
      :close-btn="false"
      :header="false"
      confirm-btn="知道了"
      :cancel-btn=null
      :on-confirm="confirmEvent"
      placement="center"
      width="480px"
		>
			<template #body>
				<div class="custtom-player">
          <div class="header">自定义播放器说明</div>
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
import 'md-editor-v3/lib/style.css';
import { computed, ref, watch } from 'vue';
import { MdPreview } from 'md-editor-v3';

import { useSettingStore } from '@/store';
import md from '@/assets/md/custom-player.md?raw';

const props = defineProps({
	visible: {
		type: Boolean,
		default: false,
	},
});

const formVisible = ref(false);
const text = ref(md);
const storeSetting = useSettingStore();
const theme = computed(() => {
  return storeSetting.displayMode;
});
const emit = defineEmits(['update:visible']);

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

const confirmEvent = () => {
  formVisible.value = false;
}
</script>

<style lang="less" scoped>
.custtom-player-dialog-container {
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
  .custtom-player {
    opacity: 1;
    .header {
      margin-top: 45px;
      font-weight: 700;
      font-size: 28px;
      text-align: center;
    }
    .main-content {
      height: 280px;
      margin: 15px auto 10px;
      overflow-y: auto;
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
