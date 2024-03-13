<template>
	<div class="custtom-player-dialog-container dialog-container-padding">
		<t-dialog v-model:visible="formVisible"
      :close-btn="false"
      :header="false"
      confirm-btn="知道了"
      :cancel-btn=null
      :on-confirm="confirmEvent"
      placement="center"
      width="480px"
		>
			<template #body>
				<div class="custtom-player">
        <div class="header">自定义播放器说明</div>
        <div class="main-content">
					<p>该功能仅供尝鲜, 尚不稳定!</p>
          <p>该功能依赖于系统命令, 可以调用环境变量 或 指定路径。</p>
          <p class="os">如何设置:</p>
					<pre><code>Window: 软件路径(一般可通过[软解图标->右键属性->目标]查看路径)

Mac: open -a /Applications/软件名.app(一般可通过[访达->应用程序->复制软件]查看路径)

Linux: 软件路径(一般可通过[whereis 软件名]查看路径)</code></pre>
          <p class="os">常见播放器</p>
					<pre><code>iina(Mac) open -a /Applications/IINA.app</code></pre>
          <pre><code>PotPlayer(Window) C:\Program Files (x86)\PotPlayer\PotPlayerMini64.exe</code></pre>
          <pre><code>VLC(Linux) /usr/bin/vlc</code></pre>
          <pre><code>VLC(Mac) open -a /Applications/VLC.app</code></pre>
          <pre><code>VLC(Window) C:\Program Files (x86)\VideoLAN\VLC\vlc.exe</code></pre>

					<p class="os">每台电脑路径需根据实际路径更改!</p>
        </div>
      </div>
			</template>
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
});

const formVisible = ref(false);

const emit = defineEmits(['update:visible']);

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

const confirmEvent = () => {
  formVisible.value = false;
}
</script>

<style lang="less" scoped>
.custtom-player-dialog-container {
  :deep(.t-dialog) {
    .t-dialog__footer {
      display: flex;
      justify-content: space-around;
			padding: 0 !important;
      .t-button {
        width: 180px;
        height: 45px;
        border-radius: 25px;
        font-weight: 700;
        font-size: 15px;
        line-height: 45px;
      }
    }
  }
  .custtom-player {
    opacity: 1;
    .header {
      margin-top: 45px;
      font-weight: 700;
      font-size: 28px;
      text-align: center;
    }
    .main-content {
      height: 220px;
      margin: 35px auto 40px;
      overflow-x: hidden;
      overflow-y: scroll;
			.os {
				color: var(--td-brand-color);
			}
      p {
        margin: 0 20px 15px;
        font-weight: 700;
        font-size: 13px;
        line-height: 22px;
        word-break: break-all;
        text-align: justify;
      }
			pre {
				white-space: pre-wrap;
				word-wrap: break-word;
				overflow-x: auto;
				background-color: var(--td-bg-color-secondarycontainer);
				border-radius: 5px;
				margin: 0 20px 15px;
				code {
					display: block;
					line-height: 22px;
					overflow-x: auto;
					white-space: pre-line;
					word-wrap: normal;
					border-radius: 4px;
					padding: 4px;
				}
			}
    }
  }
}

</style>
