<template>
  <t-dialog v-model:visible="formVisible" show-in-attached-element placement="center" :footer="false" :close-btn="false" width="620px"
    @close="closeDialog">
    <template #body>
      <div class="icon-wrapper close-btn" @click="closeDialog">
        <span class="close-icon icon">
          <close-icon size="18px" />
        </span>
      </div>
      <div>
        <div class="search-modal-header"></div>
        <div class="search-input-container">
          <div class="search-input-wrapper">
            <t-tag v-if="isVisible.filter" class="search-filter-tag">
              {{ searchTag }}
            </t-tag>
            <div class="input-wrapper">
              <input ref="searchInputRef" v-model="searchText" type="text" class="input"
                :placeholder="$t('pages.analyze.search.input')" @keyup.enter="searchEvent"
                @keyup.delete="deleteEvent" />
            </div>
            <span v-if="isVisible.filter || searchText" class="clear" @click="clearSearchEvent">{{
              $t('pages.analyze.search.clear') }}</span>
          </div>
        </div>
        <div class="search-modal-body">
          <ul v-if="!isVisible.filter" class="search-filter-list">
            <li v-for="(item, index) in VIDEOSITES" :key="index" class="search-filter-list-item"
              @click="selectFilterSearchEvent(item)">
              <div class="icon" v-html="item.img"></div>
              <span class="text">{{ $t(`pages.analyze.search.${item.id}`) }}</span>
            </li>
          </ul>
          <div v-if="searchText" class="search-footer">
            <div class="wrapper" @click="searchEvent">
              <search-icon class="icon" />
              <div class="content">
                <p class="text">
                  {{ $t('pages.analyze.search.watch') }}
                  <span class="keywords">{{ searchText }}</span>
                  {{ $t('pages.analyze.search.content') }}
                </p>
              </div>
              <span class="shortcut">Enter</span>
            </div>
          </div>
        </div>
        <div class="search-hint">
          <p class="content">
            <info-circle-icon class="search-filter-icon" />
            {{ $t('pages.analyze.search.tip', ['@']) }}
            <t-tag shape="round" class="search-tag">{{ $t('pages.analyze.search.iqiyi') }}@</t-tag>
            <t-tag shape="round" class="search-tag">{{ $t('pages.analyze.search.tencent') }}@</t-tag>
          </p>
        </div>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { CloseIcon, InfoCircleIcon, SearchIcon } from 'tdesign-icons-vue-next';
import { nextTick, reactive, ref, watch } from 'vue';

import PLATFORM_CONFIG from '@/config/platform';
import { t } from '@/locales';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:visible', 'open-platform']);

const isVisible = reactive({
  filter: false
})
const formVisible = ref(false); // 控制dialog
const searchText = ref('');
const searchTag = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);
const VIDEOSITES = { ...PLATFORM_CONFIG.site }; // 视频网站列表

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
    if (val) {
      nextTick(() => {
        focusSearchInput();
      });
    }
  },
);

// 自动匹配搜索类型
watch(
  () => searchText.value,
  (val) => {
    if (val.includes('@')) {
      const patchFlag = val.split('@')[0];
      const patchValue = val.split('@')[1];
      const item = VIDEOSITES.find(item => item.name === patchFlag) || VIDEOSITES.find(item => item.id === patchFlag);
      if (item) {
        isVisible.filter = true;
        searchTag.value = `${patchFlag}@`;
        searchText.value = patchValue || '';
      }
    }
  },
);

// 删除事件
const deleteEvent = () => {
  if (!searchText.value && searchTag.value) clearSearchEvent();
};

// 清空搜索选项
const clearSearchEvent = () => {
  isVisible.filter = false;
  searchText.value = '';
  searchTag.value = '';
};

// 聚焦 input
const focusSearchInput = () => {
  searchInputRef.value?.focus();
  searchInputRef.value?.select();
};

// 手动选择搜索源
const selectFilterSearchEvent = (item) => {
  isVisible.filter = true;
  searchTag.value = `${t(`pages.analyze.search.${item.id}`)}@`;
  focusSearchInput();
  if (searchText.value) searchEvent();
};

// 搜索
const searchEvent = () => {
  let searchDomain: string | undefined = 'https://so.360kan.com/?kw=';
  if (searchTag.value) {
    const searchTagSplite = searchTag.value.split('@')[0];
    const item = VIDEOSITES.find(item => item.name === searchTagSplite) || VIDEOSITES.find(item => item.id === searchTagSplite);
    searchDomain = item?.search;
  }
  const searchUrl = `${searchDomain}${searchText.value}`;
  console.log(`[analyze][search]${searchUrl}`);
  emit('open-platform', { name: searchText.value, url: searchUrl });
  formVisible.value = false;
};

// 关闭 dialog
const closeDialog = () => {
  isVisible.filter = false;
  searchText.value = '';
  searchTag.value = '';
  formVisible.value = false;
};
</script>

<style lang="less" scoped>
.close-btn {
  &:hover {
    background-color: var(--td-bg-color-component-hover);
  }
}

.icon-wrapper {
  height: 24px;
  width: 24px;
  display: flex;
  border-radius: 5px;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 25px;
  right: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  z-index: 10;
}

.search-modal-header {
  height: 48px;
  border-radius: 10px 10px 0 0;
}

.search-input-container {
  position: absolute;
  top: 12px;
  left: 0;
  right: 60px;
  height: 52px;
  padding-left: 24px;
  display: flex;
  align-items: center;

  .search-input-wrapper {
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
    height: 28px;

    .search-filter-tag {
      margin-right: 8px;
    }

    .input-wrapper {
      position: relative;
      flex-grow: 1;

      .input {
        outline: none;
        border: none;
        caret-color: var(--td-brand-color);
        width: 100%;
        height: 25px;
        font-size: 18px;
        line-height: 25px;
        font-weight: 600;
        position: relative;
        background-color: transparent;
        color: var(--td-text-color-primary);
      }
    }

    .clear {
      height: 28px;
      padding: 0 8px;
      font-size: 12px;
      line-height: 1.6;
      color: var(--td-text-color-primary);
      display: flex;
      align-items: center;
      flex-shrink: 0;
      border-radius: 5px;
      margin-right: 12px;
      transition: background-color 0.3s ease;
      user-select: none;

      &:hover {
        background-color: var(--td-bg-color-component-hover);
      }

      &::after {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 1px;
        height: 12px;
        background-color: var(--td-text-color-primary);
      }
    }
  }
}

.search-modal-body {
  position: relative;
  max-height: max(456px, 100vh - 330px);
  overflow-y: auto;

  .search-filter-list {
    padding: 0 12px 8px;

    .search-filter-list-item {
      display: flex;
      align-items: center;
      padding-left: 12px;
      height: 40px;
      cursor: pointer;
      border-radius: 5px;

      .icon {
        font-size: 20px;
        margin-right: 12px;
      }

      .text {
        font-size: 14px;
        line-height: 1.5;
        font-weight: 500;
        color: var(--td-text-color-primary);
      }

      &:hover {
        background-color: var(--td-bg-color-component-hover);
      }
    }
  }

  .search-footer {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0 12px 8px 12px;
    flex-shrink: 0;
    border-top: 1px solid var(--divider_tertiary);
    border-radius: 0 0 10px 10px;

    .wrapper {
      display: flex;
      align-items: center;
      padding-left: 16px;
      padding-right: 12px;
      min-height: 48px;
      border-radius: 5px;
      transition: background-color 0.3s ease;
      cursor: pointer;

      .icon {
        font-size: 24px;
        margin-right: 16px;
        flex-shrink: 0;
        color: var(--td-text-color-primary);
      }

      .content {
        flex-grow: 1;
        color: var(--td-text-color-primary);

        .text {
          word-break: break-all;

          .keywords {
            font-weight: 600;
          }
        }
      }

      .shortcut {
        flex-shrink: 0;
        pointer-events: none;
        margin-left: 12px;
      }

      &:hover {
        background-color: var(--td-bg-color-component-hover);
      }
    }
  }
}

.search-hint {
  display: flex;
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  height: 40px;
  align-items: center;
  justify-content: space-between;
  background-color: var(--td-bg-container);
  box-shadow: var(--td-shadow-1);
  border-radius: 10px;
  padding-left: 24px;
  padding-right: 16px;
  font-size: 12px;
  line-height: 1.6;

  .content {
    display: flex;
    align-items: center;

    .search-filter-icon {
      margin-right: 8px;
      font-size: 16px;
      line-height: 0;
    }

    .search-tag {
      margin-left: 8px;
    }
  }
}
</style>
