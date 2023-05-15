<template>
  <t-dialog v-model:visible="formVisible" header="导出配置" :width="646" placement="center" :footer="false">
    <template #body> </template>
  </t-dialog>
</template>

<script setup>
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';

import { iptv } from '@/lib/dexie';
import zy from '@/lib/utils/tools';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: Array,
});
const iptvData = ref(props.data);
const selectWay = ref('add-single');
const formVisible = ref(false);
const formData = ref({
  IptvInfo: {
    name: '',
    url: '',
    epg: '',
    type: 'remote',
    isActive: true,
  },
  file: { file: [] },
  url: { sitesDataURL: '' },
});
const onSubmit = ({ result, firstError }, type) => {
  if (!firstError) {
    if (type === 'single') {
      console.log('single');
      addEvent();
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
    iptvData.value = val;
  },
);
const rulesSingle = {
  name: [{ required: true, message: '请输入直播源名', type: 'error' }],
  url: [{ required: true, message: '请输入直播源订阅url', type: 'error' }],
};
const rulesFile = {
  file: [{ required: true, message: '请上传文件', type: 'error' }],
};
const rulesApi = {
  sitesDataURL: [{ required: true, message: '请输入接口url', type: 'error' }],
};

const addEvent = () => {
  if (!checkIptvName()) return;
  iptv
    .add(JSON.parse(JSON.stringify(formData.value.IptvInfo)))
    .then((res) => {
      MessagePlugin.success('添加成功');
      if (res) emit('refreshTableData');
    })
    .catch((error) => {
      MessagePlugin.error(`添加失败: ${error}`);
    });
};

const checkIptvName = () => {
  for (const s of iptvData.value) {
    if (s.name === formData.value.IptvInfo.name) {
      MessagePlugin.warning(`直播源名: ${s.name} 已存在, 请勿重复填写.`);
      return false;
    }
  }
  return true;
};

const importEvent = (file) => {
  const addIptvData = [];
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = (resultFile) => {
    const pointsTxt = resultFile.target.result;
    const json = JSON.parse(pointsTxt);
    json.forEach((ele) => {
      if (iptvData.value.filter((x) => x.name === ele.name && x.url === ele.url).length === 0) {
        // 不含相同名字、url
        if (ele.isActive === undefined) ele.isActive = true;
        if (ele.id) delete ele.id;
        addIptvData.push(ele);
      }
    });
    if (addIptvData.length !== 0) {
      iptv
        .bulkAdd(addIptvData)
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
      resolve({ status: 'success', response: { url: file.name, address: file.raw.path } });
      if (formData.value.IptvInfo.type === 'local') formData.value.IptvInfo.url = file.raw.path;
      file.percent = 100;
      clearTimeout(timer);
    }, 1000);
  });
};

// url导入
const urlEvent = async (url) => {
  const config = await zy.getConfig(url);
  iptv
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
@import '@/style/variables.less';

.input-item,
:deep(.t-upload__dragger) {
  width: calc(480px - var(--td-size-1));
}

.input-item-split {
  width: calc(480px - 130px);
}

.input-textarea {
  width: calc(480px - var(--td-size-2)) !important;
}
</style>
