<template>
	<div class="sniffer-dialog-container dialog-container-padding">
		<t-dialog v-model:visible="formVisible"
      header="嗅探方案"
			:footer="false"
      placement="center"
      width="568px"
		>
		<div class="sniffer_detail_container">
			<div class="sniffer_benefits">
				<div class="sniffer_items_container">
					<ul class="sniffer_items_list">
						<li class="list_num_2 current">
							<span class="sniffer_item_badge">基于 Puppeteer & Electron</span>
							<h5 class="sniffer_item_title">pie方案</h5>
							<div class="sniffer_item_price">
								<span class="unit">☆</span>
								<span class="final_price">嗅探能力更强，速度更快</span>
							</div>
							<p class="sniffer_item_marketing">支持无界面浏览器</p>
							<p class="sniffer_item_marketing">抓取未加载的页面</p>
							<p class="sniffer_item_marketing">拦截和修改请求</p>
							<p class="sniffer_item_bottom_marketing" @click="onSubmit('pie')">选择</p>
							</li>
						<li class="list_num_2">
							<span class="sniffer_item_badge">基于浏览器内置 API</span>
							<h5 class="sniffer_item_title">iframe方案</h5>
							<div class="sniffer_item_price">
								<span class="unit">☆</span>
								<span class="final_price">兼容性好,不需要额外依赖</span>
							</div>
							<p class="sniffer_item_marketing del">资源占用低</p>
							<p class="sniffer_item_marketing del">仅限于已加载的页面</p>
							<p class="sniffer_item_bottom_marketing" @click="onSubmit('iframe')">选择</p>
						</li>
					</ul>
				</div>
			</div>
		</div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

const props = defineProps({
	visible: {
		type: Boolean,
		default: false,
	},
});

const formVisible = ref(false);

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
				li {
					.sniffer_item_badge{
						position: absolute;
						display: inline-block;
						padding: 0 6px;
						top: -12px;
						left: 0;
						height: 24px;
						font-size: 13px;
						line-height: 24px;
						border-radius: 8px 2px 8px 2px;
						color: #d0992e;
						background: #fff9eb;
					}
					.sniffer_item_title {
						padding-top: 32px;
						font-size: 16px;
						line-height: 24px;
						font-weight: 600;
						color: #000;
						text-align: center;
					}
					.sniffer_item_bottom_marketing {
						padding: 0 5px;
						cursor: pointer;
						margin: 0;
						font-size: 14px;
						text-align: center;
						width: 100%;
						line-height: 30px;
						position: absolute;
						left: 0;
						bottom: 0;
						background-color: rgba(0,0,0,.08);
						color: #000;
						border-radius: 0 0 14px 14px;
						text-overflow: ellipsis;
						overflow: hidden;
						white-space: nowrap;
						z-index: 1;
					}
					.sniffer_item_price {
						height: 28px;
						margin-top: 18px;
						text-align: center;
						color: #8c560b;
					}
					.sniffer_item_marketing {
						line-height: 36px;
						padding: 0 5px;
						margin: 0;
						font-size: 14px;
						font-weight: 400;
						text-align: center;
						color: rgba(0,0,0,.5);
					}
				}
				li.current{
					background-image: linear-gradient(to right, #fff0d4, #ffebc4 68%, #ffe4ad);
					.sniffer_item_badge {
						color: #fff;
						background: linear-gradient(to right, #ff7d31, #ff1480);
					}
					.sniffer_item_title {
						padding-top: 30px;
						font-size: 18px;
						color: #4d0819;
					}
					.sniffer_item_bottom_marketing {
						color: var(--td-text-color-primary);
						font-weight: 500;
						background-color: #ffd37a;
					}
					.sniffer_item_marketing {
						color: #946b63;
					}
				}
			}
		}
	}
}
</style>