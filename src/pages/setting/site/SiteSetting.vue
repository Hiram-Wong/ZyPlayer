<template>
  <div class="setting-site-container">
    <div class="header">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <!-- 删除无二次确认，谨慎操作！ -->
        </div>
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
            <div class="item" @click="formDialogVisibleAddApi = true">
              <t-icon size="1.5em" name="add" />
              <span>添加</span>
            </div>
            <div class="item" @click="checkAllSite">
              <t-icon size="1.5em" name="refresh" />
              <span>检测</span>
            </div>
          </div>
        </div>
      </t-row>
    </div>
    <t-table
      row-key="id"
      :data="emptyData ? [] : data"
      :columns="COLUMNS"
      :hover="true"
      :loading="dataLoading"
      :header-affixed-top="{ offsetTop: 0, container: `.setting-site-container` }"
      @select-change="rehandleSelectChange"
    >
      <template #isActive="{ row }">
        <t-switch v-model="row.isActive" @change="propChangeEvent(row)">
          <template #label="tip">{{ tip.value ? '开' : '关' }}</template>
        </t-switch>
      </template>
      <template #status="{ row }">
        <t-tag v-if="row.status" theme="success" variant="light">可用</t-tag>
        <t-tag v-else theme="danger" variant="light">失效</t-tag>
      </template>
      <template #op="slotProps">
        <a class="t-button-link" @click="defaultEvent(slotProps)">默认</a>
        <a class="t-button-link" @click="checkSingleEvent(slotProps)">检测</a>
        <a class="t-button-link" @click="editEvent(slotProps)">编辑</a>
        <a class="t-button-link" @click="removeEvent(slotProps)">删除</a>
      </template>
    </t-table>
    <dialog-form-add-api v-model:visible="formDialogVisibleAddApi" :data="data" @refresh-table-data="getSites" />
    <dialog-form-edit-site v-model:visible="formDialogVisibleEditSite" :data="formData" />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { saveAs } from 'file-saver';
import { sites, setting } from '@/lib/dexie';
import zy from '@/lib/site/tools';
import DialogFormAddApi from './components/DialogFormAddApi.vue';
import DialogFormEditSite from './components/DialogFormEditSite.vue';
import { COLUMNS } from './constants';

// Define item form data & dialog status
const formDialogVisibleAddApi = ref(false);
const formDialogVisibleEditSite = ref(false);
const formData = ref();
const isCheckStatusChangeActive = ref();

// Define table
const emptyData = ref(false);
const dataLoading = ref(false);
const data = ref([]);
const selectedRowKeys = ref([]);
const rehandleSelectChange = (val) => {
  selectedRowKeys.value = val;
};

// Business Processing
const getSites = () => {
  dataLoading.value = true;
  try {
    sites.all().then((res) => {
      if (!res) emptyData.value = true;
      res.forEach((element) => {
        if (element.reverseOrder === null || element.reverseOrder === undefined) {
          element.reverseOrder = false;
        }
      });
      data.value = res;
    });
  } catch (e) {
    console.log(e);
  } finally {
    dataLoading.value = false;
  }
};

const getCheckStatusChangeActive = () => {
  setting.get('defaultCheckModel').then((res) => {
    isCheckStatusChangeActive.value = res;
  });
};

onMounted(() => {
  getSites();
  getCheckStatusChangeActive();
});

// op
const propChangeEvent = (row) => {
  console.log(row.isActive);
  sites.update(row.id, { isActive: row.isActive });
};

const checkAllSite = async () => {
  const uncheckedList = data.value.filter((e) => e.status === undefined || e.status === ' '); // 未检测过的优先
  const other = data.value.filter((e) => !uncheckedList.includes(e));
  await Promise.all(uncheckedList.map((site) => checkSingleEvent(site, true)));
  await Promise.all(other.map((site) => checkSingleEvent(site, true))).then(() => {
    getSites();
    MessagePlugin.success('源站批量检测完成,自动重置状态!');
  });
};

const checkSingleEvent = async (row, all = false) => {
  let res;
  if (!all) res = row.row;
  else res = row;

  const souceStatus = res.isActive; // 原状态
  const resultStatus = await zy.check(res.key); // 检测状态
  if (isCheckStatusChangeActive.value) res.isActive = resultStatus; // 检测是否开启变更状态
  res.status = resultStatus;
  console.log(souceStatus, resultStatus);
  if (souceStatus !== resultStatus) {
    console.log(res);
    sites.update(res.id, res);
  }
  if (!all) MessagePlugin.success('源站检测完成,自动重置状态!');
  return res.status;
};

const editEvent = (row) => {
  formData.value = data.value[row.rowIndex];
  formDialogVisibleEditSite.value = true;
};

const removeEvent = (row) => {
  sites
    .remove(row.row.id)
    .then(() => {
      getSites();
      MessagePlugin.success('删除成功');
    })
    .catch((err) => {
      MessagePlugin.error(`删除源失败, 错误信息:${err}`);
    });
};

const removeAllEvent = () => {
  if (selectedRowKeys.value.length === 0) {
    MessagePlugin.warning('请先选择数据');
    return;
  }
  selectedRowKeys.value.forEach((element) => {
    console.log(element);
    sites.remove(element).catch((err) => {
      MessagePlugin.error(`批量删除源失败, 错误信息:${err}`);
    });
  });
  getSites();
  MessagePlugin.success('批量删除成功');
};

const exportEvent = () => {
  const arr = [...data.value];
  const str = JSON.stringify(arr, null, 2);
  const blob = new Blob([str], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `sites.json`);
  MessagePlugin.success('导出成功');
};

const defaultEvent = async (row) => {
  console.log(row.row.name, row.row.key);
  setting.update({
    defaultSite: {
      name: row.row.name,
      key: row.row.key,
    },
  });
  MessagePlugin.success('设置成功');
};
</script>

<style lang="less" scoped>
@import '@/style/variables';
.setting-site-container {
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
