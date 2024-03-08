<template>
	<div class="sniffer-dialog-container dialog-container-padding">
		<t-dialog v-model:visible="formVisible"
      header="嗅探方案"
			:footer="false"
      placement="center"
      width="428px"
		>
		<div class="sniffer_detail_container">
			<div class="sniffer_benefits">
				<div class="sniffer_items_container">
					<div class="sniffer_items_list">
            <div class="sku-wrapper list_num_2" :class="{ 'selected': formData.data === 'pie' }" @click="onSubmit('pie')">
              <div class="content">
                <div class="corner_sign">PuppeteerInElectron</div>
                <div class="sku-name">拦截和修改请求</div>
                <div class="main-ability">嗅探能力强</div>
                <div class="secondary-ability">支持未加载页面</div>
              </div>
            </div>
            <div class="sku-wrapper list_num_2" :class="{ 'selected': formData.data === 'iframe' }" @click="onSubmit('iframe')">
              <div class="content">
                <div class="corner_sign">浏览器原生接口</div>
                <div class="sku-name">资源占用低</div>
                <div class="main-ability">兼容性好</div>
                <div class="secondary-ability">仅限已加载页面</div>
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

const emit = defineEmits(['update:visible', 'receiveSnifferData']);

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

const onSubmit = async (snifferType) => {
  emit('receiveSnifferData', {
    data: snifferType,
		type: 'snifferType'
  });

  formVisible.value = false;
};
</script>

<style lang="less" scoped>
.sniffer_detail_container {
	.sniffer_benefits {
		.sniffer_items_container {
			.sniffer_items_list {
				display: flex;
				.list_num_2 {
					width: 247px;
					cursor: default;
					border-radius: 14px;
					position: relative;
					background: #f7f7f7;
					margin-right: 9px;
				}
        .sku-wrapper {
          background-color: var(--td-bg-content-input);
          border-radius: 10px;
          padding: 20px 12px 12px;
          color: rgba(var(--td-text-color-primary), 0.72);
          cursor: pointer;
          width: 180px;
          min-height: 112px;
          position: relative;
          border: 2px solid rgba(0,0,0,0);
          box-sizing: border-box;
          &.selected {
            position: relative;
            border: 2px solid rgba(0,0,0,0);
            border-radius: 10px;
            background-clip: padding-box,border-box;
            background-origin: padding-box,border-box;
            background-image: linear-gradient(-45deg, var(--td-bg-color-secondarycontainer), var(--td-bg-color-secondarycontainer)),linear-gradient(-45deg, #c8f2d7 0%, #45c58b 0.01%, #20a2ff 98.96%);
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
            .content{
              .corner_sign {
                color: #fff;
                background: linear-gradient(288deg, #45c58b 14%, #06e6c5 85%);
              }
              .sku-name {
                background: linear-gradient(281deg, #4571c5 2%, #94dab2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: rgba(0,0,0,0);
                background-clip: text;
                text-fill-color: rgba(0,0,0,0);
              }
              .main-ability {
                background: linear-gradient(133deg, #94dab2 14%, #45c2c5 85%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: rgba(0,0,0,0);
                background-clip: text;
                text-fill-color: rgba(0,0,0,0);
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
            }
          }
        }
			}
		}
	}
}
</style>