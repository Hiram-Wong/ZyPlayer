<template>
  <div class="sniffer-dialog-container dialog-container-padding">
    <t-dialog v-model:visible="formVisible" :header="$t('pages.setting.sniffer.title')" :footer="false"
      placement="center" width="608px">
      <div class="sniffer_detail_container">
        <div class="sniffer_benefits">
          <div class="sniffer_items_container">
            <div class="sniffer_items_list">
              <div class="sku-wrapper list_num_2" :class="{ 'selected': formData.data.type == 'pie' }"
                @click="onSubmit('pie')">
                <div class="content">
                  <div class="corner_sign">{{ $t('pages.setting.sniffer.pie.sign') }}</div>
                  <div class="sku-name">{{ $t('pages.setting.sniffer.pie.name') }}</div>
                  <div class="main-ability">{{ $t('pages.setting.sniffer.pie.mainAbility') }}</div>
                  <div class="secondary-ability">{{ $t('pages.setting.sniffer.pie.secondaryAbility') }}</div>
                </div>
              </div>
              <div class="sku-wrapper list_num_2" :class="{ 'selected': formData.data.type == 'iframe' }"
                @click="onSubmit('iframe')">
                <div class="content">
                  <div class="corner_sign">{{ $t('pages.setting.sniffer.iframe.sign') }}</div>
                  <div class="sku-name">{{ $t('pages.setting.sniffer.iframe.name') }}</div>
                  <div class="main-ability">{{ $t('pages.setting.sniffer.iframe.mainAbility') }}</div>
                  <div class="secondary-ability">{{ $t('pages.setting.sniffer.iframe.secondaryAbility') }}</div>
                </div>
              </div>
              <div class="sku-wrapper list_num_2" :class="{ 'selected': formData.data.type == 'custom' }"
                @click="onSubmit('custom')">
                <div class="content">
                  <div class="corner_sign">{{ $t('pages.setting.sniffer.other.sign') }}</div>
                  <div class="sku-name">{{ $t('pages.setting.sniffer.other.name') }}</div>
                  <div class="main-ability">{{ $t('pages.setting.sniffer.other.mainAbility') }}</div>
                  <div class="secondary-ability" style="height: 17px;">
                    <t-input v-model="formData.data.url" :placeholder="$t('pages.setting.placeholder.general')"
                      :style="{ height: '100%', width: '143px' }" @blur="onSubmit('custom')">
                      <template #prefix-icon>
                        <link-icon />
                      </template>
                    </t-input>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { LinkIcon } from 'tdesign-icons-vue-next';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => {
      return {
        data: '',
        type: '',
      };
    },
  },
});

const formVisible = ref(false);
const formData = ref(props.data);

const emit = defineEmits(['update:visible', 'receiveData']);

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
    formData.value = val;
  },
);

const onSubmit = (snifferMode) => {
  formData.value.data.type = snifferMode;

  emit('receiveData', {
    data: {
      type: snifferMode,
      url: formData.value.data.url
    },
    type: 'snifferMode'
  });
};
</script>

<style lang="less" scoped>
.sniffer_detail_container {
  .sniffer_benefits {
    .sniffer_items_container {
      display: flex;
      flex-direction: column;

      .sniffer_items_list {
        display: flex;
        justify-content: space-between;

        .list_num_2 {
          width: 247px;
          cursor: default;
          border-radius: 14px;
          position: relative;
          background: #f7f7f7;
        }

        .sku-wrapper {
          background-color: var(--td-bg-content-input);
          border-radius: 10px;
          padding: 20px 12px 12px;
          color: rgba(var(--td-text-color-primary), 0.72);
          cursor: pointer;
          width: 171px;
          min-height: 112px;
          position: relative;
          border: 2px solid rgba(0, 0, 0, 0);
          box-sizing: border-box;

          &.selected {
            position: relative;
            border: 2px solid rgba(0, 0, 0, 0);
            border-radius: 10px;
            background-clip: padding-box, border-box;
            background-origin: padding-box, border-box;
            background-image: linear-gradient(-45deg, var(--td-bg-color-secondarycontainer), var(--td-bg-color-secondarycontainer)), linear-gradient(-45deg, #c8f2d7 0%, #45c58b 0.01%, #20a2ff 98.96%);

            &::before {
              position: absolute;
              left: 0;
              right: 0;
              top: 0;
              bottom: 0;
              margin: -2px;
              border-radius: 10px;
              content: "";
              background: linear-gradient(304deg, rgb(32 255 206 / 18%) 0%, rgb(154 185 238 / 18%) 100%);
            }

            .content {
              .corner_sign {
                color: #fff;
                background: linear-gradient(288deg, #45c58b 14%, #06e6c5 85%);
              }

              .sku-name {
                background: linear-gradient(281deg, #4571c5 2%, #94dab2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: rgba(0, 0, 0, 0);
                background-clip: text;
                text-fill-color: rgba(0, 0, 0, 0);
              }

              .main-ability {
                background: linear-gradient(133deg, #94dab2 14%, #45c2c5 85%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: rgba(0, 0, 0, 0);
                background-clip: text;
                text-fill-color: rgba(0, 0, 0, 0);
              }
            }
          }

          .content {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;

            .corner_sign {
              position: absolute;
              top: -13px;
              right: -2px;
              padding: 2px 12px;
              color: var(--td-brand-color-6);
              border-radius: 6px 10px 0px 6px;
              background: var(--td-brand-color-2);
              font-size: 12px;
            }

            .sku-name {
              font-size: 14px;
              line-height: 17px;
              font-weight: 600;
              white-space: pre-wrap;
            }

            .main-ability {
              font-variant-numeric: initial;
              font-feature-settings: initial;
              font-size: 26px;
              line-height: 28px;
              height: 28px;
              font-weight: 600;
            }

            .secondary-ability {
              font-size: 14px;
              line-height: 17px;

              :deep(.t-input) {
                height: 17px;
                background-color: transparent !important;
              }
            }
          }
        }
      }

      .bundle {
        background: var(--td-bg-content-input);
        border-radius: 10px;
        font-size: 12px;
        margin-top: 6px;
        padding: 12px 8px;
        position: relative;
      }
    }
  }
}
</style>
