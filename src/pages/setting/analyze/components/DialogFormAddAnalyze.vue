<template>
  <t-dialog v-model:visible="formVisible" header="新建" :width="680" :footer="false">
    <template #body>
      <t-space direction="vertical">
        <t-radio-group v-model="selectWay" variant="default-filled" style="width: auto">
          <t-radio-button value="add-single">订阅配置</t-radio-button>
          <t-radio-button value="add-file">文件导入</t-radio-button>
          <t-radio-button value="add-api">源站接口</t-radio-button>
        </t-radio-group>
        <!-- 表单内容-单个添加 -->
        <t-form
          v-if="selectWay == 'add-single'"
          colon
          :data="formData.single"
          :rules="rulesSingle"
          :label-width="100"
          @submit="onSubmit($event, 'single')"
        >
          <t-form-item label="接口名称" name="name">
            <t-input v-model="formData.single.name" class="input-item" placeholder="请输入内容" />
          </t-form-item>
          <t-form-item label="解析接口" name="url">
            <t-input v-model="formData.single.url" class="input-item" placeholder="请输入内容" />
          </t-form-item>
          <div class="optios">
            <t-form-item style="float: right">
              <t-space>
                <t-button variant="outline" @click="onClickCloseBtn">取消</t-button>
                <t-button theme="primary" type="submit">确定</t-button>
              </t-space>
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
              <t-space>
                <t-button variant="outline" @click="onClickCloseBtn">取消</t-button>
                <t-button theme="primary" type="submit">确定</t-button>
              </t-space>
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
              <t-space>
                <t-button variant="outline" @click="onClickCloseBtn">取消</t-button>
                <t-button theme="primary" type="submit">确定</t-button>
              </t-space>
            </t-form-item>
          </div>
        </t-form>
      </t-space>
    </template>
  </t-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { analyze } from '@/lib/dexie';
import zy from '@/lib/site/tools';

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
});
const analyzeData = ref(props.data);
const selectWay = ref('add-single');
const formVisible = ref(false);

const formData = ref({
  single: {
    name: '',
    url: '',
    isActive: true,
  },
  url: { sitesDataURL: '' },
  file: { file: [] },
});
const onSubmit = ({ result, firstError }, type) => {
  if (!firstError) {
    if (type === 'single') {
      console.log('single');
      addEvent({ ...formData.value.single });
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
  },
);
watch(
  () => props.data,
  (val) => {
    analyzeData.value = val;
  },
);

// 表单校验
const rulesSingle = {
  name: [{ required: true, message: '请输入源站名', type: 'error' }],
  url: [{ required: true, message: '请输入Api接口url', type: 'error' }],
};
const rulesFile = {
  file: [{ required: true, message: '请上传文件', type: 'error' }],
};
const rulesApi = {
  sitesDataURL: [{ required: true, message: '请输入接口url', type: 'error' }],
};

// 单个添加
const addEvent = (data) => {
  analyze
    .add(data)
    .then((res) => {
      MessagePlugin.success('添加成功');
      if (res) emit('refreshTableData');
    })
    .catch((error) => {
      MessagePlugin.error(`添加失败: ${error}`);
    });
};

// 文件导入
const importEvent = (file) => {
  const addData = [];
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = (resultFile) => {
    const pointsTxt = resultFile.target.result;
    const json = JSON.parse(pointsTxt);
    json.forEach((ele) => {
      if (ele.url && analyzeData.value.filter((x) => x.name === ele.name && x.api === ele.api).length === 0) {
        // 不含相同key、名字、url
        if (ele.isActive === undefined) ele.isActive = true;
        if (ele.id) delete ele.id;
        addData.push(ele);
      }
    });
    if (addData.length !== 0) {
      analyze
        .bulkAdd(addData)
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

// 文件事件
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

// url导入
const urlEvent = async (url) => {
  const config = await zy.getConfig(url);
  analyze
    .bulkAdd(config)
    .then((res) => {
      MessagePlugin.success('导入成功');
      if (res) emit('refreshTableData');
    })
    .catch((error) => {
      MessagePlugin.error(`导入失败：${error}`);
    });
};
</script>
<style lang="less" scoped>
@import '@/style/variables';
:deep(.t-form:not(.t-form-inline) .t-form__item:last-of-type) {
  margin-bottom: var(--td-comp-margin-xxl);
}
.input-item {
  width: 480px;
}
</style>
