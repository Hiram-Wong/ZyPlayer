<template>
  <t-dialog v-model:visible="formVisible" header="添加" :width="646" placement="center" :footer="false">
    <template #body>
      <div class="dialog-container-padding">
        <div class="t-radio-group__header">
          <t-radio-group v-model="selectWay" variant="default-filled" size="small">
            <t-radio-button value="add-single">订阅配置</t-radio-button>
            <t-radio-button value="add-easy">一键导入</t-radio-button>
          </t-radio-group>
        </div>

        <!-- 表单内容-单个添加 -->
        <t-form
          v-if="selectWay == 'add-single'"
          :data="formData.siteInfo"
          :rules="rulesSingle"
          :label-width="60"
          @submit="onSubmit($event, 'single')"
        >
          <t-form-item label="名称" name="name">
            <t-input v-model="formData.siteInfo.name" placeholder="请输入内容" />
          </t-form-item>
          <t-form-item label="类型" name="type">
            <t-radio-group v-model="formData.siteInfo.type">
              <t-radio :value="0">cms[xml]</t-radio>
              <t-radio :value="1">cms[json]</t-radio>
              <t-radio :value="2">drpy[js0]</t-radio>
              <!-- <t-radio :value="3">drpy[js1]</t-radio> -->
              <t-radio :value="3">app[v3]</t-radio>
              <t-radio :value="4">app[v1]</t-radio>
              <!-- <t-radio :value="5">爬虫</t-radio> -->
            </t-radio-group>
          </t-form-item>
          <t-form-item label="接口" name="api">
            <t-input v-model="formData.siteInfo.api" placeholder="请输入内容" />
          </t-form-item>
          <t-form-item label="搜索" name="search">
            <t-radio-group v-model="formData.siteInfo.search">
              <t-radio :value="0">关闭</t-radio>
              <t-radio :value="1">聚合搜索</t-radio>
              <t-radio :value="2">本站搜索</t-radio>
            </t-radio-group>
          </t-form-item>
          <!-- <t-form-item label="下载" name="download">
            <t-input v-model="formData.siteInfo.download" placeholder="请输入内容" />
          </t-form-item> -->
          <t-form-item label="解析" name="playUrl">
            <t-input v-model="formData.siteInfo.playUrl" placeholder="请输入内容" />
          </t-form-item>
          <t-form-item label="分组" name="type">
            <t-select
              v-model="formData.siteInfo.group"
              creatable
              filterable
              placeholder="请选择分组"
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
          <t-form-item label="类别" name="categories">
            <t-input v-model="formData.siteInfo.categories" placeholder="请输入内容,逗号分隔" />
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
          v-if="selectWay == 'add-easy'"
          :data="formData.easy" 
          :rules="rulesEasy"
          :label-width="60"
          @submit="onSubmit($event, 'easy')"
        >
          <t-form-item label="类型" name="type">
            <t-radio-group v-model="formData.easy.type">
              <t-radio value="drpy">drpy接口</t-radio>
              <t-radio value="tvbox">tvbox接口</t-radio>
            </t-radio-group>
          </t-form-item>
          <t-form-item label="地址" name="url">
            <t-textarea
              v-model="formData.easy.url"
              class="textarea-input"
              placeholder="请输入一键配置链接"
              autofocus
              :autosize="{ minRows: 3, maxRows: 3 }"
            />
          </t-form-item>
          <p class="tip bottom-tip">
            <span>将清除已有数据源, </span>
            <span v-show="formData.easy.type === 'drpy'" class="tip">目前仅支持sites中type:1的数据,并将js模式设置为0。</span>
            <span v-show="formData.easy.type === 'tvbox'" class="tip">目前仅支持sites中type:0或1且的cms类型的数据。</span>
          </p>
          <div class="optios">
            <t-form-item style="float: right">
              <t-button variant="outline" @click="onClickCloseBtn">取消</t-button>
              <t-button theme="primary" type="submit">确定</t-button>
            </t-form-item>
          </div>
        </t-form>
      </div>
    </template>
  </t-dialog>
</template>

<script setup>
import { MessagePlugin } from 'tdesign-vue-next';
import getUuid from 'uuid-by-string';
import { ref, reactive, watch } from 'vue';

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
// key, name, api, download, playUrl, isActive, group;
const formData = reactive({
  siteInfo: {
    key: '',
    name: '',
    api: '',
    download: '',
    playUrl: '',
    group: '',
    search: 2,
    status: true,
    isActive: true,
    type: 1,
  },
  easy: {
    type: 'drpy',
    url: ''
  }
});
const onSubmit = ({ result, firstError }, type) => {
  if (!firstError) {
    if (type === 'single') {
      console.log('single');
      addSite();
    } else if (type === 'easy') {
      console.log('easy');
      urlEvent();
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
    console.log(`[siteGroup] value:${val.map((item) => item.value).join(',')}`);
  },
);

const rulesSingle = {
  name: [{ required: true, message: '请输入源站名', type: 'error' }],
  api: [{ required: true, message: '请输入接口', type: 'error' }],
  type: [{ required: true, message: '请选择类型', type: 'error' }],
  search: [{ required: true, message: '请选择搜索', type: 'error' }],
};

const rulesEasy = {
  type: [{ required: true, message: '请选择类型', type: 'error' }],
  url: [{ required: true, message: '请输入配置地址', type: 'error' }],
};

// url导入
const urlEvent = async () => {
  const config = await zy.getConfig(formData.url).catch((error) => {
    MessagePlugin.error(`请求一键配置地址失败：${error}`);
  });
  console.log(config);

  try {
    // 清空数据
    await sites.clear();

    const drpyResFilter = config.sites
      .filter((item) => item.type === 0 || item.type === 1) // 先过滤掉不需要的数据
      .map((item) => ({
        key: item.key,
        name: item.name,
        type: formData.type === 'drpy' ? 2 : 1,
        api: item.api,
        group: formData.type === 'drpy' ? 'drpy' : 'tvbox',
        search: item.searchable,
        isActive: true,
        status: true,
      }));
      console.log(drpyResFilter);
      await sites.bulkAdd(drpyResFilter);

    filmEmitReload.emit('film-reload');
    MessagePlugin.success('一键配置成功,畅享点点滴滴吧！');
  } catch (error) {
    MessagePlugin.error(`一键配置失败：${error}`);
    console.log(error);
  }
};

const addSite = () => {
  if (formData.siteInfo.key) {
    if (!checkSiteKey()) return;
  } else {
    formData.siteInfo.key = getUuid(formData.siteInfo.name, 5);
  }
  if (!formData.siteInfo.group) formData.siteInfo.group = '默认';
  sites
    .add(JSON.parse(JSON.stringify(formData.siteInfo)))
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
    if (s.key === formData.siteInfo.key) {
      MessagePlugin.warning(`源站标识: ${s.key} 已存在, 请勿重复填写.`);
      return false;
    }
  }
  return true;
};

const createOptions = (val) => {
  const targetIndex = siteGroup.value.findIndex((obj) => obj.label === val);
  if (targetIndex === -1) siteGroup.value.push({ value: val, label: val });
};
</script>

<style lang="less" scoped>
.input-item,
:deep(.t-upload__dragger) {
  width: calc(532px - var(--td-size-1));
}
</style>
