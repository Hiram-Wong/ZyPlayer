<template>
  <t-dialog v-model:visible="formVisible" :header="$t('pages.setting.dialog.edit')" :width="650" placement="center"
    :footer="false">
    <template #body>
      <!-- 表单内容 -->
      <t-form ref="form" :data="formData" :rules="rules" :label-width="60" @submit="onSubmit">
        <t-form-item :label="$t('pages.setting.site.name')" name="name">
          <t-input v-model="formData.name" :placeholder="$t('pages.setting.placeholder.general')" />
        </t-form-item>
        <t-form-item :label="$t('pages.setting.site.type')" name="type">
          <t-radio-group v-model="formData.type">
            <t-radio :value="0">cms[xml]</t-radio>
            <t-radio :value="1">cms[json]</t-radio>
            <t-radio :value="2">drpy[js0]</t-radio>
            <t-radio :value="6">hipy[t4]</t-radio>
            <t-radio :value="7">js[t3]</t-radio>
            <t-radio :value="8">catvod[nodejs]</t-radio>
            <t-radio :value="3">app[v3]</t-radio>
            <t-radio :value="4">app[v1]</t-radio>
            <!-- <t-radio :value="5">爬虫</t-radio> -->
          </t-radio-group>
        </t-form-item>
        <t-form-item :label="$t('pages.setting.site.api')" name="api">
          <t-input v-if="formData.type !== 5" v-model="formData.api"
            :placeholder="$t('pages.setting.placeholder.general')" />
          <t-textarea v-else v-model="formData.api" :placeholder="$t('pages.setting.placeholder.general')" />
        </t-form-item>
        <t-form-item :label="$t('pages.setting.site.search')" name="search">
          <t-radio-group v-model="formData.search">
            <t-radio :value="0">{{ $t('pages.setting.table.site.close') }}</t-radio>
            <t-radio :value="1">{{ $t('pages.setting.table.site.together') }}</t-radio>
            <t-radio :value="2">{{ $t('pages.setting.table.site.local') }}</t-radio>
          </t-radio-group>
        </t-form-item>
        <!-- <t-form-item label="筛选" name="filter">
          <t-switch v-model="formData.filter" :label="['开', '关']"/>
        </t-form-item> -->
        <!-- <t-form-item label="下载" name="download">
          <t-input v-model="formData.download" :placeholder="$t('pages.setting.placeholder.general')" />
        </t-form-item> -->
        <t-form-item :label="$t('pages.setting.site.playUrl')" name="playUrl">
          <t-input v-model="formData.playUrl" :placeholder="$t('pages.setting.placeholder.general')" />
        </t-form-item>
        <t-form-item :label="$t('pages.setting.site.ext')" name="ext">
          <t-input v-model="formData.ext" :placeholder="$t('pages.setting.placeholder.general')" />
        </t-form-item>
        <t-form-item :label="$t('pages.setting.site.group')" name="group">
          <t-select v-model="formData.group" creatable filterable
            :placeholder="$t('pages.setting.placeholder.groupTip')" class="input-item" @create="createOptions">
            <t-option v-for="item in formGroup" :key="item.value" :value="item.value" :label="item.label"
              class="select-options" />
          </t-select>
        </t-form-item>
        <t-form-item :label="$t('pages.setting.site.category')" name="category">
          <t-input v-model="formData.categories" :placeholder="$t('pages.setting.placeholder.categoryTip')" />
        </t-form-item>

        <div class="optios">
          <t-form-item style="float: right">
            <t-button variant="outline" @click="onClickCloseBtn">{{ $t('pages.setting.dialog.cancel') }}</t-button>
            <t-button theme="primary" type="submit">{{ $t('pages.setting.dialog.confirm') }}</t-button>
          </t-form-item>
        </div>
      </t-form>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';

import { updateSiteItem } from '@/api/site';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
  group: {
    type: Object,
    default: () => {
      return [];
    },
  },
});
const formVisible = ref(false);
const formData = ref(props.data);
const formGroup = ref(props.group);

const onSubmit = async () => {
  try {
    await updateSiteItem(formData.value.id, formData.value)
    MessagePlugin.success('修改成功');
    formVisible.value = false;
  } catch (err) {
    console.log('Errors: ', err);
    MessagePlugin.error(`修改失败, 错误信息:${err}`);
  }
};

const onClickCloseBtn = () => {
  formVisible.value = false;
};
const emit = defineEmits(['update:visible', 'refreshTableData']);
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
    if (!val) emit('refreshTableData');
  },
);
watch(
  () => props.data,
  (val) => {
    formData.value = val;
  },
);
watch(
  () => props.group,
  (val) => {
    formGroup.value = val;
  },
);

const createOptions = (val) => {
  const targetIndex = formGroup.value.findIndex((obj) => obj.label === val);
  if (targetIndex === -1) formGroup.value.push({ value: val, label: val });
};

const rules = {
  name: [{ required: true, message: '请输入源站名', type: 'error' }],
  api: [{ required: true, message: '请输入接口', type: 'error' }],
  type: [{ required: true, message: '请选择类型', type: 'error' }],
  search: [{ required: true, message: '请选择搜索', type: 'error' }],
  filter: [{ required: true, message: '请选择筛选', type: 'error' }],
};
</script>

<style lang="less" scoped></style>
