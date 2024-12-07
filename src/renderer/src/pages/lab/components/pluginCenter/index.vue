<template>
  <div class="plugin-center view-container">
    <div class="header">
      <div class="left-operation-container">
        <h3 class="title">{{ $t('pages.lab.pluginCenter.title') }}</h3>
      </div>
      <div class="right-operation-container">
        <t-radio-group variant="default-filled" v-model="active.nav" @change="handleOpChange">
          <t-radio-button value="install">{{ $t('pages.lab.pluginCenter.control.install') }}</t-radio-button>
          <t-radio-button value="file">{{ $t('pages.lab.pluginCenter.file') }}</t-radio-button>
        </t-radio-group>
      </div>

      <t-dialog
        :visible="active.install"
        show-in-attached-element
        :header="$t('pages.lab.pluginCenter.control.install')"
        :confirm-btn="{
          content: $t('pages.lab.pluginCenter.installDialog.confirm'),
          theme: 'primary',
          loading: installFormData.loading,
        }"
        @close="active.install = false"
        @confirm="handleInstall('install', installFormData.pluginName)"
      >
      <div class="data-dialog-container dialog-container-padding">
        <div class="data-item top"></div>
        <div class="data-item">
          <p class="title-label mg-b-s">{{ $t('pages.lab.pluginCenter.installDialog.step') }}1</p>
          <p class="tip">{{ $t('pages.lab.pluginCenter.installDialog.tip.tip1') }}</p>
          <t-button block @click="handleGoDir">{{ $t('pages.lab.pluginCenter.installDialog.goDir') }}</t-button>
        </div>
        <div class="data-item">
          <p class="title-label mg-b-s">{{ $t('pages.lab.pluginCenter.installDialog.step') }}2</p>
          <p class="tip">{{ $t('pages.lab.pluginCenter.installDialog.tip.tip2') }}</p>
          <t-input v-model="installFormData.pluginName" :placeholder="$t('pages.setting.placeholder.general')" class="mg-b-s"></t-input>
        </div>
      </div>
      </t-dialog>
    </div>
    <div class="content" v-if="pluginList.length > 0">
      <div class="aside left">
        <t-list class="nav-menu" :scroll="{ type: 'virtual' }" style="height: 100%;">
          <t-list-item v-for="(item, index) in pluginList" :key="index" :class="[active.aside === item.name ? 'is-active' : '']">
            <t-tooltip :content="item.pluginName" destroy-on-close>
              <t-list-item-meta :description="item.pluginName" @click="handleItemClick(item.name)" />
            </t-tooltip>
          </t-list-item>
        </t-list>
      </div>
      <div class="main right">
        <div class="plugin-header data-item">
          <p class="title-label">{{ $t('pages.lab.pluginCenter.info.title') }}</p>
          <div class="title txthide">
            <span class="space">{{ pluginInfo.name }}</span>
            <span>v{{ pluginInfo.version  || '0.0.0' }}</span>
          </div>
          <div class="author txthide">
            <span class="space">{{ $t('pages.lab.pluginCenter.info.author') }}:</span>
            <span>{{ pluginInfo.author || $t('pages.lab.pluginCenter.empty') }}</span>
          </div>
          <div class="desc txthide txthide2">
            <span class="space">{{ $t('pages.lab.pluginCenter.info.desc') }}:</span>
            <span>{{ pluginInfo.description || $t('pages.lab.pluginCenter.empty') }}</span>
          </div>
        </div>
        <div class="plugin-control center">
          <p class="title-label">{{ $t('pages.lab.pluginCenter.control.title') }}</p>
          <div class="status txthide">
            <span class="space">{{ $t('pages.lab.pluginCenter.info.status') }}:</span>
            <span class="tag space">
              <t-tag theme="success" size="small" v-if="pluginInfo.status === 'RUNNING'">{{ $t('pages.lab.pluginCenter.info.start') }}</t-tag>
              <t-tag theme="danger" size="small" v-else-if="pluginInfo.status === 'STOPED'">{{ $t('pages.lab.pluginCenter.info.stop') }}</t-tag>
            </span>
            <t-loading size="small" :loading="active.controlLoad" />
          </div>
          <t-radio-group variant="default-filled" v-model="active.control" @change="handleControlChange(active.control, pluginInfo.name)">
            <t-radio-button value="start">{{ $t('pages.lab.pluginCenter.control.start') }}</t-radio-button>
            <t-radio-button value="stop">{{ $t('pages.lab.pluginCenter.control.stop') }}</t-radio-button>
            <t-radio-button value="uninstall">{{ $t('pages.lab.pluginCenter.control.uninstall') }}</t-radio-button>
          </t-radio-group>
        </div>
        <div class="plugin-readme data-item">
          <p class="title-label">{{ $t('pages.lab.pluginCenter.content.title') }}</p>
          <div class="md">
            <md-render class="custom-md" :markdownText="pluginInfo.readme" />
          </div>
        </div>
      </div>
    </div>
    <div class="empty" v-if="pluginList.length === 0">
      <t-empty />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';
import { list, install, uninstall, start, stop} from '@/api/plugin';
import MdRender from '@/components/markdown-render/index.vue';

const pluginList = ref<any[]>([]);
const pluginInfo = ref<{ [key: string]: string }>({});
const active = ref({
  nav: '',
  aside: '',
  install: false,
  control: '',
  controlLoad: false
});
const installFormData = ref({
  pluginName: '',
  loading: false,
});

onMounted(()=>{
  fetchData();
});

const fetchData = async () => {
  const res = await list();
  if (res && res.length > 0) {
    pluginList.value = res;
    active.value.aside = res[0].name;
    pluginInfo.value = res[0];
  }
}

const handleItemClick = (name: string) => {
  active.value.aside = name;
  pluginInfo.value = pluginList.value.find(p => p.name === name);
}

const handleGoDir = async() => {
  window.electron.ipcRenderer.send('open-path', 'plugin', true);
}

const handleControl = async (type: string, name: string) => {
  const methodMap = {
    start: start,
    stop: stop,
    uninstall: uninstall,
    install: install,
  };

  if (!methodMap?.[type]) return;

  try {
    const updatedPluginList = await methodMap[type]([ name ]);
    const checkSuccess = () => {
      return type === 'uninstall' ? true : updatedPluginList && updatedPluginList.length > 0;
    };

    if (checkSuccess()) {
      MessagePlugin.success(`${t('pages.setting.form.success')}`);
      if (type === 'uninstall') {
        pluginList.value = pluginList.value.filter(p => p.name !== name);
        pluginInfo.value = pluginList.value.length > 0 ? pluginList.value[0] : {};
        active.value.aside = pluginList.value.length > 0 ? pluginList.value[0].name : '';
      } else if (type === 'install') {
        const installIndex = pluginList.value.findIndex(p => p.name === updatedPluginList[0].name);
        if (installIndex > -1) pluginList.value[installIndex] = updatedPluginList[0];
        else pluginList.value.unshift(updatedPluginList[0]);
        pluginInfo.value = updatedPluginList[0];
        active.value.aside = updatedPluginList[0].name;
      } else {
        const updateIndex = pluginList.value.findIndex(p => p.name === name);
        if (updateIndex > -1) {
          pluginList.value[updateIndex] = updatedPluginList[0];
          pluginInfo.value = updatedPluginList[0];
        }
      }
    } else {
      MessagePlugin.warning(`${t('pages.setting.form.fail')}`);
    }
  } catch (err: any) {
    console.log(`[pluginCenter][install][error]`, err);
    MessagePlugin.error(`${t('pages.setting.form.fail')}: ${err.message}`);
  };
}

const handleControlChange = async (type: string, name: string) => {
  active.value.control = '';

  if (!['install','uninstall','start','stop','update','upgrade'].includes(type)) return;
  if (active.value.controlLoad) {
    MessagePlugin.warning(t('pages.lab.pluginCenter.control.cancelTip'));
    return;
  }

  active.value.controlLoad = true;
  await handleControl(type, name);
  active.value.controlLoad = false;
}

const handleInstall = async (type: string, name: string) => {
  if (installFormData.value.loading) {
    MessagePlugin.warning(t('pages.lab.pluginCenter.control.cancelTip'));
    return;
  }

  installFormData.value.loading = true;
  await handleControl(type, name);
  installFormData.value.loading = false;

  active.value.install = false;
}

const handleOpChange = (type:string) => {
  active.value.nav = '';

  switch (type) {
    case 'install':
      active.value.install = true;
      break;
    case 'file':
      handleGoDir();
      break;
  }
}
</script>

<style lang="less" scoped>
.view-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--td-size-4);

  .header {
    display: flex;
    justify-content: space-between;
    align-content: center;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;

    .left-operation-container {
      display: flex;
      flex-direction: row;
      align-items: center;

      .title {
        margin-right: 5px;
      }
    }

    .right-operation-container {
      :deep(.t-radio-group.t-size-m) {
        background-color: var(--td-bg-content-input-2);
        border-color: transparent;

        .t-radio-button {
          padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingLR-s);
          background-color: var(--td-bg-content-input-2);
          border-color: transparent;
        }
        .t-select__wrap {
          width: fit-content;
          position: relative;
          height: calc(var(--td-comp-size-m) -(var(--td-comp-paddingTB-xxs)* 2));

          .t-input--auto-width {
            min-width: 44px;
          }
          &:hover {
            .t-input__inner {
              color: var(--td-text-color-primary);
            }
          }
          .t-input__inner {
            color: var(--td-text-color-secondary);
            font: var(--td-font-body-medium);
          }
          .t-input {
            .t-input__suffix:not(:empty) {
              display: none;
            }
          }
        }
        .t-select__wrap::before {
          content: "";
          position: absolute;
          left: 0px;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: calc(100% - 24px);
          background-color: var(--td-component-border);
          transition: opacity 0.2s cubic-bezier(0, 0, 0.15, 1);
          z-index: 2;
        }
      }

      .component-op {
        display: flex;
        height: var(--td-comp-size-m);
        padding: 0 var(--td-comp-paddingLR-xs);
        background-color: var(--td-bg-content-input-2);
        border-radius: var(--td-radius-default);
        align-items: center;

        .item-pad-select {
          padding: 0 4px !important;
        }

        .item {
          color: var(--td-text-color-placeholder);
          border-radius: var(--td-radius-default);
          display: flex;
          align-items: center;
          padding: 2px 4px;
          height: 22px;
          cursor: pointer;
          text-decoration: none;

          :deep(.t-input) {
            padding: 0;
            border: none;
            width: 46px;
            height: var(--td-comp-size-s);
            font: var(--td-font-body-medium);
            background-color: transparent !important;

            .t-input__suffix:not(:empty) {
              margin-left: var(--td-comp-margin-xxs);
            }

            &:hover:not(.t-input--focused) {
              border-color: transparent;
              height: 24px;
            }
          }

          :deep(.t-input__inner) {
            color: var(--td-text-color-placeholder);
          }

          &:hover {
            transition: all 0.2s ease 0s;
            color: var(--td-text-color-primary);
            background-color: var(--td-bg-color-container-hover);
          }
        }
      }
    }
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    grid-gap: var(--td-comp-margin-s);
    width: 100%;
    height: calc(100% - 32px);

    .title-label {
      font: var(--td-font-title-medium);
      margin-bottom: var(--td-comp-margin-s);
    }

    .aside {
      width: 150px;
      height: 100%;

      :deep(.t-list-item) {
        width: 146px;
        cursor: pointer;
        padding: 0;
        transition: background-color .3s ease;
        border-radius: var(--td-radius-medium);

        &:not(:first-child) {
          margin-top: var(--td-comp-margin-xs);
        }

        &:hover {
          background-color: var(--td-bg-content-hover-2);
        }

        .t-list-item-main {
          .t-list-item__meta {
            overflow: hidden;
            display: block;
            width: 100%;
            padding: var(--td-comp-paddingTB-s) 0 var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-m);
            margin-right: var(--td-comp-paddingLR-m);

            .t-list-item__meta-description {
              margin-right: 0;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
          }
        }
      }

      :deep(.is-active) {
        background-color: var(--td-bg-content-active-2);
      }
    }

    .main {
      flex: 1;
      height: 100%;
      width: 100%;
      max-width: calc(100% - 150px - var(--td-comp-margin-s));
      display: flex;
      flex-direction: column;
      gap: var(--td-size-4);

      span.space {
        margin-right: var(--td-comp-margin-s);
      }

      .plugin-header {

        .title {
          font-size: 18px;
          font-weight: 600;
        }
      }

      .plugin-control {
        .status {
          margin-bottom: var(--td-comp-margin-s)
        }
      }

      .plugin-readme {
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .md {
          overflow: auto;
          height: 100%;
          flex: 1;

          .custom-md {
            :deep(a) {
              pointer-events: none;
            }
          }
        }
      }
    }
  }

  .empty {
    flex: 1;
    width: 100%;
    height: 100%;
  }
}
</style>
