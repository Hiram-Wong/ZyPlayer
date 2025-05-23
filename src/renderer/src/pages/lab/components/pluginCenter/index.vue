<template>
  <div class="plugin-center view-container">
    <div class="header">
      <div class="left-operation-container">
        <h3 class="title">{{ $t('pages.lab.pluginCenter.title') }}</h3>
      </div>
      <div class="right-operation-container">
        <t-radio-group variant="default-filled" v-model="active.nav" @change="handleOpChange">
          <t-radio-button value="install">{{ $t('pages.lab.pluginCenter.control.install') }}</t-radio-button>
        </t-radio-group>
      </div>

      <t-dialog
        v-model:visible="active.installDialog"
        show-in-attached-element
        attach="#main-component"
        placement="center"
        width="50%"
      >
        <template #header>
          {{ $t('pages.lab.pluginCenter.control.install') }}
        </template>
        <template #body>
          <t-form ref="formRef" :data="formData" :rules="RULES" :label-width="60"  :requiredMark="false">
            <div class="data-item">
              <p class="title-label mg-b-s">{{ $t('pages.lab.pluginCenter.installDialog.step') }}1</p>
              <p class="t-tip mg-b-s">{{ $t('pages.lab.pluginCenter.installDialog.tip.tip1') }}</p>
              <t-button block class="mg-b-s" @click="handleGoDir">{{ $t('pages.lab.pluginCenter.installDialog.goDir') }}</t-button>
            </div>
            <div class="data-item">
              <p class="title-label mg-b-s">{{ $t('pages.lab.pluginCenter.installDialog.step') }}2</p>
              <p class="t-tip mg-b-s">{{ $t('pages.lab.pluginCenter.installDialog.tip.tip2') }}</p>
              <t-form-item name="pluginName" label-width="0px">
                <t-input v-model="formData.pluginName" :placeholder="$t('pages.setting.placeholder.general')"></t-input>
              </t-form-item>
            </div>
          </t-form>
        </template>
        <template #footer>
          <t-button variant="outline" @click="onCancel">{{ $t('pages.setting.dialog.cancel') }}</t-button>
          <t-button theme="primary" @click="onSubmit" :loading="active.installLoading">{{ $t('pages.setting.dialog.install') }}</t-button>
        </template>
      </t-dialog>
    </div>

    <div class="content" v-if="pluginList.length > 0">
      <div class="nav">
        <title-menu :list="navList" :active="active.aside" @change-key="handleItemClick" />
      </div>

      <div class="main">
        <div class="plugin-header">
          <div class="icon_wrapper">
            <div class="bg"></div>
            <t-image
              class="icon"
              shape="round"
              :src="pluginInfo.logo"
              :style="{ width: '64px', height: '64px' }"
              :lazy="true"
              fit="cover"
              :loading="renderLoading"
              :error="renderError"
            />
          </div>
          <div class="details">
            <h1 class="title">
              <span class="name">{{ pluginInfo.pluginName || '' }}</span>
              <span class="version">v{{ pluginInfo.version || '0.0.0' }}</span>
            </h1>
            <span class="desc txthide txthide2"> {{ pluginInfo.description || $t('pages.lab.pluginCenter.empty') }}</span>
            <div class="info">
              <div class="status info-item" v-if="pluginInfo.type === 'system'">
                <application-icon class="icon" />
                <t-loading size="small" :loading="active.controlLoad?.[pluginInfo.name] === true" v-if="active.controlLoad?.[pluginInfo.name]" />
                <template v-else>
                  <t-tag theme="success" size="small" v-if="pluginInfo.status === 'RUNNING'">{{ $t('pages.lab.pluginCenter.info.start') }}</t-tag>
                  <t-tag theme="danger" size="small" v-else>{{ $t('pages.lab.pluginCenter.info.stop') }}</t-tag>
                </template>
              </div>
              <div class="author info-item">
                <verified-icon class="icon" />
                <span>{{ pluginInfo.author || $t('pages.lab.pluginCenter.empty') }}</span>
              </div>
            </div>
          </div>
          <div class="actions">
            <t-dropdown theme="default" trigger="click" destroy-on-close>
              <t-button theme="default" shape="square" variant="outline" class="control_btn">
                <caret-down-small-icon />
              </t-button>
              <t-dropdown-menu>
                <t-dropdown-item v-if="pluginInfo.type === 'system'" value="start" @click="handleControlChange('start', pluginInfo.name)"> {{ $t('pages.lab.pluginCenter.control.start') }}</t-dropdown-item>
                <t-dropdown-item v-if="pluginInfo.type === 'system'" value="stop" @click="handleControlChange('stop', pluginInfo.name)"> {{ $t('pages.lab.pluginCenter.control.stop') }}</t-dropdown-item>
                <t-dropdown-item v-if="pluginInfo.type === 'ui' "value="devtool" @click="handleOpenDevtool"> {{ $t('pages.lab.pluginCenter.control.devtool') }}</t-dropdown-item>
              </t-dropdown-menu>
            </t-dropdown>
            <t-popconfirm
              :content="$t('pages.lab.pluginCenter.control.uninstallTip')"
              @confirm="handleControlChange('uninstall', pluginInfo.name)"
            >
              <t-button theme="danger" class="uninstall_btn">{{ $t('pages.lab.pluginCenter.control.uninstall') }}</t-button>
            </t-popconfirm>
          </div>
        </div>

        <div class="plugin-readme data-item" v-if="pluginInfo.type === 'system'">
          <p class="title-label">{{ $t('pages.lab.pluginCenter.content.title') }}</p>
          <div class="md">
            <md-render class="custom-md" :text="pluginInfo.readme" :label="label" />
          </div>
        </div>
        <div class="plugin-webview data-item" v-if="pluginInfo.type === 'ui'">
          <p class="title-label">{{ $t('pages.lab.pluginCenter.webview.title') }}</p>
          <div class="plugin-content" >
            <webview class="custom-webview" ref="webviewRef" :src="pluginInfo.main" partition="persist:plugin" allowpopups />
          </div>
        </div>
      </div>
    </div>

    <div class="empty" v-if="pluginList.length === 0">
      <t-empty />
    </div>
  </div>
</template>

<script lang="tsx" setup>
import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue';
import { FormInstanceFunctions, FormProps, MessagePlugin } from 'tdesign-vue-next';
import { ApplicationIcon, CaretDownSmallIcon, LoadingIcon, VerifiedIcon } from 'tdesign-icons-vue-next';
import { t } from '@/locales';
import { list, install, uninstall, start, stop} from '@/api/plugin';
import MdRender from '@/components/markdown-render/index.vue';
import TitleMenu from '@/components/title-menu/index.vue';
import logoIcon from '@/assets/icon.png';

const pluginList = ref<any[]>([]);
const pluginInfo = ref<{ [key: string]: string }>({});
const formData = ref({ pluginName: '' });
const formRef = useTemplateRef<FormInstanceFunctions>('formRef');
const active = ref({
  nav: '',
  aside: '',
  installDialog: false,
  installLoading: false,
  control: '',
  controlLoad: {}
});
const webviewRef = ref<any>(null);
const label = computed(() => {
  return {
    copy: t('pages.md.label.copy'),
    lang: t('pages.md.label.lang'),
    copySuccess: t('pages.md.label.copySuccess'),
    copyError: t('pages.md.label.copyError'),
  }
});

const renderError = () => {
  return (
    <div class="renderIcon">
      <img src={logoIcon} style="width: 64px; height: 64px; margin-top: 4px;" />
    </div>
  );
};
const renderLoading = () => {
  return (
    <div class="renderIcon">
      <LoadingIcon size="1.5em" stroke-width="2" />
    </div>
  );
};

const navList = computed(() => {
  return pluginList.value.map(item => ({
    type_name: item.pluginName,
    type_id: item.name
  }))
});

onMounted(()=>{
  fetchData();
});

const fetchData = async () => {
  const res = await list();
  if (res && res.length > 0) {
    pluginList.value = res;
    const item = res[0];
    active.value.aside = item.name;
    pluginInfo.value = item;
  }
};

const webviewLoadError = (err: any) => {
  MessagePlugin.warning(`${t('pages.lab.pluginCenter.control.loadUiEntryError')}: ${err.errorDescription}`);
  webviewRef.value.src = 'about:blank';
};

const handleItemClick = async(name: string) => {
  active.value.aside = name;
  const item = pluginList.value.find(p => p.name === name);
  pluginInfo.value = item;
  if (pluginInfo.value.type === 'ui') nextTick(() => {
    webviewRef.value.removeEventListener('did-fail-load', webviewLoadError);
    webviewRef.value.addEventListener('did-fail-load', webviewLoadError);
  });
};

const handleGoDir = async() => {
  window.electron.ipcRenderer.send('open-path', 'plugin');
}

const handleOpenDevtool = () => {
  if (webviewRef.value) {
    webviewRef.value?.openDevTools();
  } else {
    MessagePlugin.warning(`${t('pages.lab.pluginCenter.control.devtoolDomAttchErrTip')}`);
  }
};

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
        else pluginList.value.push(updatedPluginList[0]);
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
};

const handleControlChange = async (type: string, name: string) => {
  active.value.control = '';

  if (!['install','uninstall','start','stop','update','upgrade'].includes(type)) return;
  if (active.value.controlLoad?.[name]) {
    MessagePlugin.warning(t('pages.lab.pluginCenter.control.cancelTip'));
    return;
  }

  active.value.controlLoad[name] = true;
  await handleControl(type, name);
  active.value.controlLoad[name] = false;
};

const handleInstall = async (type: string, name: string) => {
  if (active.value.installLoading) {
    MessagePlugin.warning(t('pages.lab.pluginCenter.control.cancelTip'));
    return;
  }

  active.value.installLoading = true;
  await handleControl(type, name);
  active.value.installLoading = false;

  active.value.installDialog = false;
};

const handleOpChange = (type:string) => {
  active.value.nav = '';

  switch (type) {
    case 'install':
      active.value.installDialog = true;
      break;
    case 'file':
      handleGoDir();
      break;
  }
};

const onCancel = () => {
  active.value.installDialog = false;
};

const onSubmit: FormProps['onSubmit'] = () => {
  formRef.value?.validate().then((validateResult) => {
    if (validateResult && Object.keys(validateResult).length) {
      const firstError = Object.values(validateResult)[0]?.[0]?.message;
      MessagePlugin.warning(firstError);
    } else {
      handleInstall('install', formData.value.pluginName);
    }
  });
};

const RULES = {
  pluginName: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
};
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
    height: 36px;

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
    flex-direction: column;
    justify-content: space-between;
    grid-gap: var(--td-size-4);
    width: 100%;
    height: calc(100% - 36px - var(--td-size-4));

    .nav {
      width: 100%;
    }

    .main {
      flex: 1;
      height: calc(100% - 32px - var(--td-size-4));
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--td-size-4);

      .plugin-header {
        display: flex;
        flex-direction: row;
        gap: var(--td-size-8);
        align-items: center;
        margin: auto 0;

        .icon_wrapper {
          position: relative;
          width: 96px;
          height: 96px;

          .bg {
            background-color: var(--td-bg-content-input-2);
            border-radius: var(--td-radius-extraLarge);
            width: 100%;
            height: 100%;
          }

          .icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 64px;
            height: 64px;
          }
        }

        .details {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          max-width: calc(100% - 96px - var(--td-size-8) - var(--td-size-8) - 108px);
          height: 100%;
          justify-content: space-around;

          .title {
            display: flex;
            gap: var(--td-size-4);
            align-items: flex-end;
            flex-direction: row;
            margin: 0;

            .name {
              font-size: 20px;
              font-weight: 600;
              line-height: 30px;
            }

            .version {
              font-size: 14px;
              font-weight: 400;
            }
          }

          .desc {
            font-size: 14px;
            line-height: 21px;
            color: var(--td-text-color-secondary);
            width: 100%;
            white-space: wrap;
          }

          .info {
            display: flex;
            gap: 16px;
            font-size: 13px;
            line-height: 20px;

            .info-item {
              display: flex;
              align-items: center;
              gap: var(--td-size-2);

              .icon {
                width: 16px;
                height: 16px;
              }
            }
          }
        }

        .actions {
          margin-left: auto;
          display: flex;
          gap: var(--td-size-4);

          .uninstall_btn {
            border-color: transparent;
          }

          .control_btn {
            color: var(--td-text-color-secondary);
            background-color: var(--td-bg-content-input-2);
            border-color: transparent;

            &:hover {
              :deep(.t-button__text) {
                color: var(--td-text-color-primary);
              }
            }
          }
        }
      }

      .plugin-readme {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        flex: 1;
        height: 100%;

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

      .plugin-webview {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        flex: 1;

        .plugin-content {
          overflow: auto;
          height: 100%;
          flex: 1;

          .custom-webview {
            height: 100%;
            width: 100%;

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
