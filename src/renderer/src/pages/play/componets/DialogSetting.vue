<template>
  <t-dialog
    v-model:visible="formVisible"
    :header="$t('pages.player.setting.title')"
    width="508"
    placement="center"
    :footer="false"
  >
    <template #body>
      <div class="setting-dialog-container dialog-container-padding">
        <div class="data-item top">
          <t-form ref="form" :label-width="70" :data="formData" @submit="onSubmit">
            <t-form-item :label="$t('pages.player.setting.skipHeadAndEnd')" name="skipHeadAndEnd">
              <t-radio-group variant="default-filled" v-model="formData.skipHeadAndEnd">
                <t-radio-button :value="true">{{ $t('pages.setting.form.open') }}</t-radio-button>
                <t-radio-button :value="false">{{ $t('pages.setting.form.close') }}</t-radio-button>
              </t-radio-group>
            </t-form-item>
            <div v-if="formData.skipHeadAndEnd" class="auto-skip-warp">
              <t-form-item name="skipTimeInStart">
                <t-input-number v-model="formData.skipTimeInStart" theme="normal">
                  <template #label>{{ $t('pages.player.setting.skipStart') }}</template>
                  <template #suffix>{{ $t('pages.player.setting.skipSeconds') }}</template>
                </t-input-number>
              </t-form-item>
              <t-form-item name="skipTimeInEnd">
                <t-input-number v-model="formData.skipTimeInEnd" theme="normal">
                  <template #label>{{ $t('pages.player.setting.skipEnd') }}</template>
                  <template #suffix>{{ $t('pages.player.setting.skipSeconds') }}</template>
                </t-input-number>
              </t-form-item>
            </div>
            <t-form-item :label="$t('pages.player.setting.playNextEnabled')" name="playNextEnabled">
              <t-radio-group variant="default-filled" v-model="formData.playNextEnabled">
                <t-radio-button :value="true">{{ $t('pages.setting.form.open') }}</t-radio-button>
                <t-radio-button :value="false">{{ $t('pages.setting.form.close') }}</t-radio-button>
              </t-radio-group>
            </t-form-item>
            <t-form-item :label="$t('pages.player.setting.playNextPreload')" name="playNextPreload">
              <t-radio-group variant="default-filled" v-model="formData.playNextPreload">
                <t-radio-button :value="true">{{ $t('pages.setting.form.open') }}</t-radio-button>
                <t-radio-button :value="false">{{ $t('pages.setting.form.close') }}</t-radio-button>
              </t-radio-group>
            </t-form-item>
            <t-form-item :label="$t('pages.player.setting.skipAd')" name="skipAd">
              <t-radio-group variant="default-filled" v-model="formData.skipAd">
                <t-radio-button :value="true">{{ $t('pages.setting.form.open') }}</t-radio-button>
                <t-radio-button :value="false">{{ $t('pages.setting.form.close') }}</t-radio-button>
              </t-radio-group>
            </t-form-item>
            <div class="tip bottom-tip">
              <span>{{ $t('pages.player.setting.tip') }}</span>
            </div>
            <div class="optios">
              <t-form-item style="float: right">
                <t-button variant="outline" @click="onClose">{{ $t('pages.setting.dialog.cancel') }}</t-button>
                <t-button theme="primary" type="submit">{{ $t('pages.setting.dialog.confirm') }}</t-button>
              </t-form-item>
            </div>
          </t-form>
        </div>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: {
      skipHeadAndEnd: false,
      skipTimeInStart: 30,
      skipTimeInEnd: 30,
      playNextPreload: false,
      playNextEnabled: true,
      skipAd: false
    },
  },
});

const formVisible = ref(false);
const formData = ref(props.data);

const emit = defineEmits(['update:visible', 'update']);

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

const onClose = () => {
  formVisible.value = false;
};

const onSubmit = () => {
  emit('update', { ...formData.value });
  formVisible.value = false;
};
</script>

<style lang="less" scoped>
.auto-skip-warp {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  margin-left: 70px;

  :deep(.t-form__item) {
    .t-form__controls {
      margin-left: 0 !important;
      display: block;
    }
  }

  :deep(.t-input-number) {
    width: 100px;
  }
}
</style>
