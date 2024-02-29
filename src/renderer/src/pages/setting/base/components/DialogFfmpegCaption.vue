<template>
	<div class="ffmpeg-caption-dialog-container dialog-container-padding">
		<t-dialog v-model:visible="formVisible"
      :close-btn="false"
      :header="false"
      confirm-btn="安装检测"
      cancel-btn="知道了"
      :on-confirm="confirmEvent"
      placement="center"
      width="480px"
		>
			<template #body>
				<div class="ffmpeg-caption">
        <div class="header">缩略图使用说明</div>
        <div class="main-content">
					<p>该功能仅供尝鲜, 尚不稳定!</p>
          <p>1.该功能依赖于ffmpeg, 请确保安装该软件并配置了环境变量</p>
          <p>2.命令行输入ffmpeg -version查看安装是否成功</p>
					<p>3.安装完ffmpeg模块后需重启软件后才可以检测到</p>
					<p>4.该功能会占用部分磁盘用于存储, 生成时会占用部分cpu/gpu</p>
					<p>5.如下为不同操作系统安装方法: </p>
          <p class="os">Windows:</p>
					<pre><code>1.打开FFmpeg官网,选择windows平台 选择Windows builds from gyan.dev下载
2.在release builds第一个绿框里面选择一个版本full包下载
3.下载完成后解压该压缩包,在bin文件里会有三个exe文件,复制此时的地址
4.右键单击此电脑, 点击属性, 在属性里面点击高级系统设置
5.在系统变量中, 选择 Path, 然后编辑
6.[编辑环境变量]表中, 新建, 将复制的bin目录路径粘贴进去, 保存</code></pre>
          <p class="os">MAC:</p>
					<pre><code>1.安装Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
2.安装ffmpeg
brew install ffmpeg</code></pre>
          <p class="os">Linux:</p>
          <pre><code>Ubuntu:sudo apt install FFmpeg</code></pre>
					<pre><code>Arch Linux:pacman -S ffmpeg</code></pre>
					<pre><code>Fedora:
sudo dnf install https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm
sudo dnf install https://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-
sudo dnf install ffmpeg</code></pre>
					<p class="os">其他操作系统建议百度查找安装方法!</p>
        </div>
      </div>
			</template>
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
	data: {
		type: Object,
		default: () => {
			return {
				data: [],
				type: '',
			};
		},
	},
});

const formVisible = ref(false);
const formData = ref(props.data);

const emit = defineEmits(['update:visible', 'receiveClassData']);

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

const confirmEvent = () => {
  window.electron.ipcRenderer.invoke('ffmpeg-installed-check').then(status => {
    if (status) MessagePlugin.success(`检测到ffmpeg模块已安装`);
		else MessagePlugin.error(`未检测到ffmpeg模块`);
  });
};
</script>

<style lang="less" scoped>
.ffmpeg-caption-dialog-container {
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
  .ffmpeg-caption {
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
