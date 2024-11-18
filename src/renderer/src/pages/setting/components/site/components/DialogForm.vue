<template>
  <t-dialog
    v-model:visible="formVisible"
    :header="formType === 'add' ? $t('pages.setting.dialog.add') : $t('pages.setting.dialog.edit')"
    :width="650"
    placement="center"
    :footer="false"
    @close="onClose"
  >
    <template #body>
      <t-form ref="form" :data="formData.data" :rules="RULES" :label-width="60" @submit="onSubmit" @reset="onReset">
        <t-form-item :label="$t('pages.setting.site.name')" name="name">
            <t-input v-model="formData.data.name" :placeholder="$t('pages.setting.placeholder.general')" />
          </t-form-item>
          <t-form-item :label="$t('pages.setting.site.type')" name="type">
            <t-select v-model="formData.data.type" :placeholder="$t('pages.setting.placeholder.general')" @change="changeTypeEvent">
              <t-option v-for="item in SITE_TYPE" :key="item.value" :value="item.value" :label="item.label"
                class="select-options" />
            </t-select>
          </t-form-item>
          <div class="key-group">
            <t-form-item :label="$t('pages.setting.site.key')" name="key" style="flex: 1">
              <t-input v-model="formData.data.key" :placeholder="$t('pages.setting.placeholder.general')" />
            </t-form-item>
            <t-button theme="default" @click="randomKeyEvent">{{ $t('pages.setting.random') }}</t-button>
          </div>
          <t-form-item :label="$t('pages.setting.site.api')" name="api">
            <t-input v-model="formData.data.api" :placeholder="$t('pages.setting.placeholder.general')" />
          </t-form-item>
          <t-form-item :label="$t('pages.setting.site.search')" name="search">
            <t-radio-group v-model="formData.data.search" variant="default-filled" >
              <t-radio-button :value="0">{{ $t('pages.setting.table.site.close') }}</t-radio-button>
              <t-radio-button :value="1">{{ $t('pages.setting.table.site.gatherSearch') }}</t-radio-button>
              <t-radio-button :value="2">{{ $t('pages.setting.table.site.onlySearch') }}</t-radio-button>
            </t-radio-group>
          </t-form-item>
          <t-form-item :label="$t('pages.setting.site.playUrl')" name="playUrl">
            <t-input v-model="formData.data.playUrl" :placeholder="$t('pages.setting.placeholder.general')" />
          </t-form-item>
          <t-form-item :label="$t('pages.setting.site.ext')" name="ext">
            <t-textarea v-model="formData.data.ext" :placeholder="$t('pages.setting.placeholder.general')"  :autosize="{ minRows: 1, maxRows: 3 }" />
          </t-form-item>
          <t-form-item :label="$t('pages.setting.site.group')" name="group">
            <t-select v-model="formData.data.group" creatable filterable
              :placeholder="$t('pages.setting.placeholder.groupTip')" @create="createOptions">
              <t-option v-for="item in formGroup" :key="item.value" :value="item.value" :label="item.label"
                class="select-options" />
            </t-select>
          </t-form-item>
          <t-form-item :label="$t('pages.setting.site.category')" name="category">
            <t-textarea v-model="formData.data.categories" :placeholder="$t('pages.setting.placeholder.categoryTip')" :autosize="{ minRows: 1, maxRows: 3 }" />
          </t-form-item>

        <div class="optios">
          <t-form-item style="float: right">
            <t-button variant="outline" type="reset">{{ $t('pages.setting.dialog.reset') }}</t-button>
            <t-button theme="primary" type="submit">{{ $t('pages.setting.dialog.confirm') }}</t-button>
          </t-form-item>
        </div>
      </t-form>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { t } from '@/locales';


const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: {},
  },
  type: {
    type: String,
    default: 'add'
  },
  group: {
    type: Object,
    default: {}
  },
});
const formVisible = ref(false);
const formData = ref({
  data: { ...props.data },
  raw: { ...props.data },
});
const formType = ref(props.type);
const formGroup = ref(props.group);
const SITE_TYPE = [
  {label: 'T0[xml]', value: 0},
  {label: 'T1[json]', value: 1},
  {label: 'drpy[js0]', value: 2},
  // {label: 'app[v1]', value: 3},
  // {label: 'app[v3]', value: 4},
  // {label: 'spider[xpath]', value: 5},
  {label: 'T4[hipy]', value: 6},
  {label: 'T3[js]', value: 7},
  {label: 'catvod[nodejs]', value: 8},
  {label: 'csp[XBPQ]', value: 9},
  {label: 'csp[XYQ]', value: 10},
  {label: 'csp[AppYsV2]', value: 11},
]

const emits = defineEmits(['update:visible', 'submit']);

watch(
  () => formVisible.value,
  (val) => {
    emits('update:visible', val);
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
    formData.value = {
      data: { ...val },
      raw: { ...val },
    };
  },
);
watch(
  () => props.type,
  (val) => {
    formType.value = val;
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

const changeTypeEvent = (type) => {
  switch (type) {
    case 7:
      formData.value.data.api = 'csp_DRPY';
      break;
    case 9:
      formData.value.data.api = 'csp_XBPQ';
      break;
    case 10:
      formData.value.data.api = 'csp_XYQ';
      break;
    case 11:
      formData.value.data.api = 'csp_AppYsV2';
      break;
  }
};

const randomKeyEvent = () => {
  formData.value.data.key = uuidv4();
};

const onSubmit = async ({ validateResult }) => {
  if (validateResult === true) {
    emits('submit', 'table', formData.value.data);
    formVisible.value = false;
  };
};

const onReset = () => {
  formData.value.data = { ...formData.value.raw };
};

const onClose = () => {
  onReset();
};

const RULES = {
  name: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  key: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  api: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  type: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  search: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  filter: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
};
</script>

<style lang="less" scoped>
.key-group {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--td-comp-margin-m);
  gap: 10px;
  align-items: center;
}
</style>
