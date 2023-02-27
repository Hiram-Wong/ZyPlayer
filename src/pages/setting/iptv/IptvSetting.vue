<template>
  <div class="setting-iptv-container">
    <div class="header">
      <t-row justify="space-between">
        <div class="left-operation-container"></div>
        <div class="right-operation-container">
          <div class="component-op">
            <div class="item" @click="exportEvent">
              <t-icon size="1.5em" name="arrow-up" />
              <span>导出</span>
            </div>
            <div class="item" @click="removeAllEvent">
              <t-icon size="1.5em" name="remove" />
              <span>删除</span>
            </div>
            <div class="item" @click="formDialogVisibleAddIptv = true">
              <t-icon size="1.5em" name="add" />
              <span>添加</span>
            </div>
          </div>
        </div>
      </t-row>
    </div>
    <t-table
      :row-key="rowKey"
      :data="emptyData ? [] : data"
      :columns="COLUMNS"
      :hover="true"
      :pagination="pagination"
      :loading="dataLoading"
      :selected-row-keys="selectedRowKeys"
      :header-affixed-top="{ offsetTop: 0, container: `.setting-iptv-container` }"
      @select-change="rehandleSelectChange"
    >
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

    <dialog-form-add-iptv v-model:visible="formDialogVisibleAddIptv" :data="data" @refresh-table-data="getIptv" />
    <dialog-form-edit-iptv v-model:visible="formDialogVisibleEditIptv" :data="formData" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { MessagePlugin } from 'tdesign-vue-next';
import _ from 'lodash';
import DialogFormAddIptv from './components/DialogFormAdd.vue';
import DialogFormEditIptv from './components/DialogFormEdit.vue';
import { iptv, channelList, setting } from '@/lib/dexie';
import { COLUMNS } from './constants';

// Define item form data & dialog status
const formDialogVisibleAddIptv = ref(false);
const formDialogVisibleEditIptv = ref(false);
const formData = ref();
const rowKey = 'id';
const dataLoading = ref(false);
const pagination = ref({
  defaultPageSize: 20,
  total: 0,
  defaultCurrent: 1,
});
const selectedRowKeys = ref([]);

// Define table table
const emptyData = ref(false);
const data = ref([]);
const rehandleSelectChange = (val) => {
  selectedRowKeys.value = val;
};

// Business Processing
const getIptv = () => {
  dataLoading.value = true;
  iptv.pagination().then((res) => {
    if (!res) emptyData.value = true;
    data.value = res.list;
    pagination.value.total = res.total;
  });
  dataLoading.value = false;
};
onMounted(() => {
  getIptv();
});

// op
const exportEvent = () => {
  iptv.all().then((res) => {
    const str = JSON.stringify(res, null, 2);
    const blob = new Blob([str], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `iptv.json`);
  });
};

const defaultEvent = async (row) => {
  const m3uUrl = row.row.url;
  await axios.get(m3uUrl).then((res) => {
    const { data } = res;
    // console.log(data);
    if (data) {
      if (data.trim().startsWith('#EXTM3U')) m3u(data);
      else txt(data);
      MessagePlugin.success('设置成功');
    }
  });
  setting.update({ defaultIptv: row.row.id });
};

const m3u = (text) => {
  const GROUP = /.*group-title="(.?|.+?)".*/i;
  const LOGO = /.*tvg-logo="(.?|.+?)".*/i;
  const NAME = /.*,(.+?)$/i;

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
      doc.url = line;
      docs.push(doc);
    }
  });
  channelList.clear().then((res) => {
    channelList.bulkAdd(docs).then((e) => {
      console.log(res, e);
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
    });
  });
};

const editEvent = (row) => {
  formData.value = data.value[row.rowIndex];
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
@import '@/style/variables';
.setting-iptv-container {
  .header {
    margin-bottom: 20px;
  }
  .t-button-link {
    margin-right: var(--td-comp-margin-xxl);
  }
}
.component-op {
  display: flex;
  padding: 4px;
  height: 40px;
  background: #f0f0f0;
  backdrop-filter: blur(10px);
  border-radius: 6px;
  color: #161616;
  align-items: center;
  box-shadow: 10px;
  margin-right: 20px;
  .item {
    border-radius: 5px;
    transition: all 0.2s ease 0s;
    display: flex;
    align-items: center;
    padding: 5px 8px;
    line-height: 22px;
    cursor: pointer;
    text-decoration: none;
  }
  .item:hover {
    background: #dcdcdc;
  }
}
:root[theme-mode='dark'] {
  .component-op {
    background: #484848;
    color: #eee;
    .item:hover {
      background: #5e5e5e;
    }
  }
}
</style>
