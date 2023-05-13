<template>
  <t-dialog v-model:visible="formVisible" header="添加源站" :width="646" placement="center" :footer="false">
    <template #body>
      <t-radio-group v-model="selectWay" variant="default-filled">
        <t-radio-button value="add-single">订阅配置</t-radio-button>
        <t-radio-button value="add-file">文件导入</t-radio-button>
        <t-radio-button value="add-api">源站接口</t-radio-button>
      </t-radio-group>

      <!-- 表单内容-单个添加 -->
      <t-form
        v-if="selectWay == 'add-single'"
        colon
        :data="formData.siteInfo"
        :rules="rulesSingle"
        :label-width="100"
        @submit="onSubmit($event, 'single')"
      >
        <t-form-item label="源站名" name="name">
          <t-input v-model="formData.siteInfo.name" class="input-item" placeholder="请输入内容" />
        </t-form-item>
        <t-form-item label="类型" name="type">
          <t-radio-group v-model="formData.siteInfo.type">
            <t-radio :value="1">cms(json)</t-radio>
            <t-radio :value="2">drpy</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="API接口" name="api">
          <t-input v-model="formData.siteInfo.api" class="input-item" placeholder="请输入内容" />
        </t-form-item>
        <t-form-item label="下载接口" name="download">
          <t-input v-model="formData.siteInfo.download" class="input-item" placeholder="请输入内容" />
        </t-form-item>
        <t-form-item label="解析接口" name="jiexiUrl">
          <t-input v-model="formData.siteInfo.jiexiUrl" class="input-item" placeholder="请输入内容" />
        </t-form-item>
        <t-form-item label="分组" name="type">
          <t-select
            v-model="formData.siteInfo.group"
            creatable
            filterable
            placeholder="请选择分组"
            class="input-item"
            @create="createOptions"
          >
            <t-option
              v-for="item in siteGroup"
              :key="item.value"
              :value="item.value"
              :label="item.label"
              class="select-options"
            />
          </t-select>
        </t-form-item>
        <t-form-item label="源站标识" name="key">
          <t-input v-model="formData.siteInfo.key" class="input-item" placeholder="请输入内容" />
        </t-form-item>
        <div class="optios">
          <t-form-item style="float: right">
            <t-button variant="outline" @click="onClickCloseBtn">取消</t-button>
            <t-button theme="primary" type="submit">确定</t-button>
          </t-form-item>
        </div>
      </t-form>
      <!-- 表单内容-上传文件 -->
      <t-form
        v-if="selectWay == 'add-file'"
        colon
        :data="formData.file"
        :rules="rulesFile"
        :label-width="100"
        @submit="onSubmit($event, 'file')"
      >
        <t-form-item label="文件" name="file">
          <t-upload
            v-model="formData.file.file"
            class="input-item"
            theme="file"
            accept="application/json"
            :draggable="true"
            :request-method="requestMethod"
          />
        </t-form-item>
        <div class="optios">
          <t-form-item style="float: right">
            <t-button variant="outline" @click="onClickCloseBtn">取消</t-button>
            <t-button theme="primary" type="submit">确定</t-button>
          </t-form-item>
        </div>
      </t-form>
      <!-- 表单内容-接口 -->
      <t-form
        v-if="selectWay == 'add-api'"
        colon
        :data="formData.url"
        :rules="rulesApi"
        :label-width="100"
        @submit="onSubmit($event, 'api')"
      >
        <t-form-item label="接口地址" name="sitesDataURL">
          <t-input v-model="formData.url.sitesDataURL" class="input-item" placeholder="请输入接口url" />
        </t-form-item>
        <div class="optios">
          <t-form-item style="float: right">
            <t-button variant="outline" @click="onClickCloseBtn">取消</t-button>
            <t-button theme="primary" type="submit">确定</t-button>
          </t-form-item>
        </div>
      </t-form>
    </template>
  </t-dialog>
</template>

<script setup>
import { MessagePlugin } from 'tdesign-vue-next';
import getUuid from 'uuid-by-string';
import { ref, watch } from 'vue';

import { sites } from '@/lib/dexie';
import zy from '@/lib/utils/tools';

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
      return {};
    },
  },
});
const siteData = ref(props.data);
const siteGroup = ref(props.group);
const selectWay = ref('add-single');

const formVisible = ref(false);
// key, name, api, download, jiexiUrl, isActive, group;
const formData = ref({
  siteInfo: {
    key: '',
    name: '',
    api: '',
    download: '',
    jiexiUrl: '',
    group: '',
    status: true,
    isActive: true,
    type: 1,
  },
  url: { sitesDataURL: '' },
  file: { file: [] },
});
const onSubmit = ({ result, firstError }, type) => {
  if (!firstError) {
    if (type === 'single') {
      console.log('single');
      addSite();
    } else if (type === 'file') {
      console.log('file');
      importEvent(formData.value.file.file[0].raw);
      formData.value.file.file = [];
    } else {
      console.log('api');
      urlEvent(formData.value.url.sitesDataURL);
    }
    formVisible.value = false;
  } else {
    console.log('Errors: ', result);
    MessagePlugin.warning(firstError);
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
    siteData.value = val;
  },
);
watch(
  () => props.group,
  (val) => {
    siteGroup.value = val;
    console.log(siteGroup.value);
  },
);
const rulesSingle = {
  name: [{ required: true, message: '请输入源站名', type: 'error' }],
  api: [{ required: true, message: '请输入Api接口url', type: 'error' }],
  type: [{ required: true, message: ' 请选择类型', type: 'error' }],
};
const rulesFile = {
  file: [{ required: true, message: '请上传文件', type: 'error' }],
};
const rulesApi = {
  sitesDataURL: [{ required: true, message: '请输入接口url', type: 'error' }],
};

// url导入
const urlEvent = async (url) => {
  const config = await zy.getConfig(url);
  sites
    .bulkAdd(config)
    .then((res) => {
      MessagePlugin.success('导入成功');
      if (res) emit('refreshTableData');
    })
    .catch((error) => {
      MessagePlugin.error(`导入失败：${error}`);
    });
};

const addSite = () => {
  if (formData.value.siteInfo.key) {
    if (!checkSiteKey()) return;
  } else {
    formData.value.siteInfo.key = getUuid(formData.value.siteInfo.name, 5);
  }
  if (!formData.value.siteInfo.group) formData.value.siteInfo.group = '默认';
  sites
    .add(JSON.parse(JSON.stringify(formData.value.siteInfo)))
    .then((res) => {
      MessagePlugin.success('添加成功');
      if (res) emit('refreshTableData');
    })
    .catch((error) => {
      MessagePlugin.error(`添加失败: ${error}`);
    });
};
const checkSiteKey = () => {
  for (const s of siteData.value) {
    if (s.key === formData.value.siteInfo.key) {
      MessagePlugin.warning(`源站标识: ${s.key} 已存在, 请勿重复填写.`);
      return false;
    }
  }
  return true;
};
const importEvent = (file) => {
  const addSiteData = [];
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = (resultFile) => {
    const pointsTxt = resultFile.target.result;
    const json = JSON.parse(pointsTxt);
    json.forEach((ele) => {
      if (
        ele.api &&
        siteData.value.filter((x) => x.key === ele.key).length === 0 &&
        siteData.value.filter((x) => x.name === ele.name && x.api === ele.api).length === 0
      ) {
        // 不含相同key、名字、url
        if (ele.isActive === undefined) ele.isActive = true;
        if (ele.group === undefined) ele.group = '默认';
        if (ele.id) delete ele.id;
        addSiteData.push(ele);
      }
    });
    if (addSiteData.length !== 0) {
      sites
        .bulkAdd(addSiteData)
        .then((res) => {
          MessagePlugin.success('导入成功');
          if (res) emit('refreshTableData');
        })
        .catch((error) => {
          MessagePlugin.error(`导入失败：${error}`);
        });
    } else {
      MessagePlugin.warning('暂无更新数据');
    }
  };
};
const requestMethod = (file) => {
  return new Promise((resolve) => {
    // file.percent 用于控制上传进度，如果不希望显示上传进度，则不对 file.percent 设置值即可。
    // 如果代码规范不能设置 file.percent，也可以设置 files
    file.percent = 0;
    const timer = setTimeout(() => {
      // resolve 参数为关键代码
      resolve({ status: 'success', response: { url: file.name } });
      file.percent = 100;
      clearTimeout(timer);
    }, 1000);
  });
};

const createOptions = (val) => {
  const targetIndex = siteGroup.value.findIndex((obj) => obj.label === val);
  if (targetIndex === -1) siteGroup.value.push({ value: val, label: val });
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';

.input-item,
:deep(.t-upload__dragger) {
  width: calc(480px - var(--td-size-1));
}
</style>
