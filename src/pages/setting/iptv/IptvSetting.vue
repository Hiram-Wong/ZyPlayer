<template>
  <div class="setting-iptv-container">
    <div class="header">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <div class="component-op">
            <div class="item" @click="formDialogVisibleAddIptv = true">
              <add-icon />
              <span>添加</span>
            </div>
            <div class="item" @click="removeAllEvent">
              <remove-icon />
              <span>删除</span>
            </div>
            <div class="item" @click="exportEvent">
              <arrow-up-icon />
              <span>导出</span>
            </div>
          </div>
        </div>
        <div class="right-operation-container">
          <div class="search">
            <t-input v-model="searchValue" placeholder="搜索频道资源" clearable @enter="getIptv" class="search-bar">
              <template #prefix-icon>
                <search-icon size="16px" />
              </template>
            </t-input>
          </div>
        </div>
      </t-row>
    </div>
    <t-table
      :row-key="rowKey"
      :data="emptyData ? [] : data"
      :sort="sort"
      height="calc(100vh - 205px)"
      table-layout="auto"
      :columns="COLUMNS"
      :hover="true"
      :pagination="pagination"
      :loading="dataLoading"
      :selected-row-keys="selectedRowKeys"
      @sort-change="rehandleSortChange"
      @select-change="rehandleSelectChange"
      @page-change="rehandlePageChange"
    >
      <template #name="{ row }">
        <t-badge v-if="row.id === defaultIptv" size="small" :offset="[-5, 0]" count="默">{{ row.name }}</t-badge>
        <span v-else>{{ row.name }}</span>
      </template>
      <template #type="{ row }">
        <span v-if="row.type === 'remote'">远程链接</span>
        <span v-if="row.type === 'local'">本地文件</span>
        <span v-if="row.type === 'batches'">手动配置</span>
      </template>
      <template #isActive="{ row }">
        <t-switch v-model="row.isActive" @change="propChangeEvent(row)">
          <template #label="tip">{{ tip.value ? '开' : '关' }}</template>
        </t-switch>
      </template>
      <template #op="slotProps">
        <a class="t-button-link" @click="defaultEvent(slotProps)">默认</a>
        <a class="t-button-link" @click="editEvent(slotProps)">编辑</a>
        <a class="t-button-link" @click="removeEvent(slotProps)">删除</a>
      </template>
    </t-table>

    <dialog-add-view v-model:visible="formDialogVisibleAddIptv" :data="data" @refresh-table-data="getIptv" />
    <dialog-edit-view v-model:visible="formDialogVisibleEditIptv" :data="rowEditData" />
  </div>
</template>
<script setup lang="ts">
import { useEventBus } from '@vueuse/core';
import _ from 'lodash';
import { AddIcon, ArrowUpIcon, RemoveIcon, SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref } from 'vue';

import { channelList, iptv, setting } from '@/lib/dexie';
import zy from '@/lib/utils/tools';

import DialogAddView from './components/DialogAdd.vue';
import DialogEditView from './components/DialogEdit.vue';
import { COLUMNS } from './constants';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

const remote = window.require('@electron/remote');

// Define item form data & dialog status
const formDialogVisibleAddIptv = ref(false);
const formDialogVisibleEditIptv = ref(false);
const searchValue = ref();
const rowEditData = ref();
const rowKey = 'id';
const dataLoading = ref(false);
const pagination = ref({
  defaultPageSize: 20,
  total: 0,
  defaultCurrent: 1,
});
const selectedRowKeys = ref([]);
const defaultIptv = ref();
const sort = ref();

// Define table table
const emptyData = ref(false);
const data = ref([]);
const rehandleSelectChange = (val) => {
  selectedRowKeys.value = val;
};

const rehandlePageChange = (curr) => {
  pagination.value.defaultCurrent = curr.current;
  pagination.value.defaultPageSize = curr.pageSize;
};

const rehandleSortChange = (sortVal, options) => {
  // sort.value 和 data.value 的赋值都是必须
  sort.value = sortVal;
  data.value = options.currentDataSource;
};

// Business Processing
const getIptv = async () => {
  dataLoading.value = true;
  defaultIptv.value = await setting.get('defaultIptv');
  try {
    const res = await iptv.pagination(searchValue.value);
    if (!res) emptyData.value = true;
    data.value = res.list;
    pagination.value.total = res.total;
  } catch (e) {
    console.log(e);
  } finally {
    dataLoading.value = false;
  }
};

onMounted(() => {
  getIptv();
});

// 导出接口
const exportEvent = () => {
  const arr = [...data.value];
  const str = JSON.stringify(arr, null, 2);
  const blob = new Blob([str], { type: 'text/plain;charset=utf-8' });
  const reader = new FileReader();
  reader.onload = () => {
    const result: ArrayBuffer = reader.result as ArrayBuffer;
    const buffer = Buffer.from(result);
    remote.dialog
      .showSaveDialog(remote.getCurrentWindow(), {
        defaultPath: 'iptv.json',
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
      })
      .then((saveDialogResult) => {
        if (!saveDialogResult.canceled) {
          const { filePath } = saveDialogResult;
          const fs = remote.require('fs');
          fs.writeFile(filePath, buffer, 'utf-8', (err) => {
            if (err) {
              console.error('Failed to save file:', err);
              MessagePlugin.error('Failed to save file');
            } else {
              console.log('File saved successfully');
              MessagePlugin.success('File saved successfully');
            }
          });
        }
      })
      .catch((err) => {
        console.error('Failed to open save dialog:', err);
        MessagePlugin.error('Failed to open save dialog');
      });
  };
  reader.readAsArrayBuffer(blob);
};

const emitReload = useEventBus<string>('iptv-reload');

const defaultEvent = async (row) => {
  const { url, type } = row.row;
  let fileContent;

  try {
    if (type === 'local') {
      fileContent = await fs.promises.readFile(url, 'utf8');
    } else if (type === 'remote') {
      fileContent = await zy.getConfig(url);
    } else {
      fileContent = url;
    }
    console.log(fileContent);

    if (fileContent) {
      if (fileContent.trim().startsWith('#EXTM3U')) {
        m3u(fileContent);
      } else txt(fileContent);
      setting.update({ defaultIptv: row.row.id });
      defaultIptv.value = row.row.id;
    }

    MessagePlugin.success('设置成功');
  } catch (err) {
    const errMsg = err.message || err;
    console.error(`失败: ${errMsg}`);
    if (type === 'local') {
      MessagePlugin.error(`读取失败: ${errMsg}`);
    } else {
      MessagePlugin.error(`请求失败: ${errMsg}`);
    }
  }

  console.log(fileContent);
  emitReload.emit('iptv-reload');
};

const m3u = (text) => {
  const GROUP = /.*group-title="(.?|.+?)".*/i;
  const LOGO = /.*tvg-logo="(.?|.+?)".*/i;
  const NAME = /.*,(.+?)(?:$|\n|\s)/i;

  const docs = [];
  let doc;
  const splitList = text.split('\n');
  splitList.forEach((line) => {
    if (line.startsWith('#EXTINF:')) {
      doc = {}; // 切断指针的联系
      doc.name = line.match(NAME) ? line.match(NAME)[1] : '';
      doc.logo = line.match(LOGO) ? line.match(LOGO)[1] : '';
      doc.group = line.match(GROUP) ? line.match(GROUP)[1] : '';
    } else if (line.indexOf('://') > -1) {
      if (line.startsWith('#EXT-X-SUB-URL')) return; // #EXT-X-SUB-URL https://ghproxy.com/https://raw.githubusercontent.com/Kimentanm/aptv/master/m3u/iptv.m3u
      if (line.startsWith('#EXTM3U')) return; // #EXTM3U url-tvg="http://epg.51zmt.top:8000/e.xml,https://epg.112114.xyz/pp.xml
      doc.url = line;
      docs.push(doc);
    }
  });
  channelList.clear().then((res) => {
    channelList.bulkAdd(docs).then((e) => {
      console.log(res, e);
      emitReload.emit('iptv-reload');
    });
  });
};

const txt = (text) => {
  const docs = [];
  let group;
  const splitList = text.split('\n');
  splitList.forEach((line) => {
    const split = line.split(',');
    if (split.length < 2) return;
    if (line.indexOf('#genre#') > -1) [group] = split;
    if (split[1].indexOf('://') > -1) {
      const doc = {
        name: split[0],
        url: split[1],
        group,
      };
      docs.push(doc);
    }
  });
  channelList.clear().then((res) => {
    channelList.bulkAdd(docs).then((e) => {
      console.log(res, e);
      emitReload.emit('iptv-reload');
    });
  });
};

const editEvent = (row) => {
  rowEditData.value =
    data.value[row.rowIndex + pagination.value.defaultPageSize * (pagination.value.defaultCurrent - 1)];
  formDialogVisibleEditIptv.value = true;
};

const propChangeEvent = (row) => {
  iptv.update(row.id, { isActive: row.isActive === true });
};

const removeEvent = (row) => {
  iptv
    .remove(row.row.id)
    .then(() => {
      getIptv();
      MessagePlugin.success('删除成功');
    })
    .catch((error) => {
      MessagePlugin.error(`删除源失败, 错误信息:${error}`);
    });
};

const removeAllEvent = () => {
  if (selectedRowKeys.value.length === 0) {
    MessagePlugin.warning('请先选择数据');
    return;
  }
  console.log(selectedRowKeys.value);
  selectedRowKeys.value.forEach((element) => {
    iptv.remove(element).catch((error) => {
      MessagePlugin.error(`批量删除源失败, 错误信息:${error}`);
    });
  });
  getIptv();
  MessagePlugin.success('批量删除成功');
};
</script>

<style lang="less" scoped>
.setting-iptv-container {
  height: calc(100vh - var(--td-comp-size-l));
  .header {
    margin-bottom: var(--td-comp-margin-s);
  }
  .t-button-link {
    margin-right: var(--td-comp-margin-xxl);
  }
  .left-operation-container {
    .component-op {
      display: flex;
      height: 32px;
      padding: 0 var(--td-comp-paddingLR-xs);
      background-color: var(--td-bg-input);
      backdrop-filter: blur(10px);
      border-radius: var(--td-radius-default);
      align-items: center;
      .item {
        border-radius: var(--td-radius-default);
        transition: all 0.2s ease 0s;
        display: flex;
        align-items: center;
        padding: 2px 4px;
        height: 22px;
        cursor: pointer;
        text-decoration: none;
      }
      .item:hover {
        color: var(--td-text-color-primary);
        background-color: var(--td-bg-color-component-hover);
      }
    }
  }

  :deep(.t-table) {
    background-color: var(--td-bg-color-container);
    tr {
      background-color: var(--td-bg-color-container);
      &:hover {
        background-color: var(--td-bg-color-container-hover);
      }
    }
  }
  :deep(.t-table__header--fixed):not(.t-table__header--multiple) > tr > th {
    background-color: var(--td-bg-color-container);
  }
  :deep(.t-table__pagination) {
    background-color: var(--td-bg-color-container);
  }
}
</style>
