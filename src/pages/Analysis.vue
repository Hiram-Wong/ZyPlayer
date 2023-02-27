<template>
  <div class="analysis-container mx-auto">
    <div class="analysis-main">
      <div class="analysis-main-header" @dblclick="showSupportEvent">
        <span class="play_title">{{ urlTitle ? urlTitle : '暂无播放内容' }}</span>
      </div>
      <div class="analysis-main-play">
        <iframe
          ref="iframeRef"
          :key="key"
          class="analysis-play-box"
          :class="isSupport ? 'analysis-play-box-hidden' : 'analysis-play-box-show'"
          :src="url"
          allowtransparency="true"
          frameborder="0"
          scrolling="no"
          allowfullscreen="true"
        ></iframe>
        <div class="analysis-setting">
          <div class="analysis-setting-group">
            <t-input-adornment>
              <template #prepend>
                <t-select
                  v-model="selectAnalysisApi"
                  :loading="analysisApiLoading"
                  placeholder="请选择接口"
                  size="large"
                  style="width: 10em"
                >
                  <t-option v-for="item in analysisApi" :key="item.id" :label="item.name" :value="item.url" />
                </t-select>
              </template>
              <input v-model="analysisUrl" class="analysis-url" placeholder="请在此处粘贴视频网址" />
              <template #append>
                <span class="analysis-play" @click="analysisEvent">
                  <p class="analysis-tip">解析</p>
                </span>
              </template>
            </t-input-adornment>
          </div>
        </div>
      </div>
      <div v-if="isSupport" class="analysis-main-bottom">
        <div class="support-title">
          <span class="support-separator"></span>
          <p class="support-tip">支持平台</p>
        </div>
        <div class="support-platform">
          <div v-for="(item, index) in VIDEOSITES" :key="index" class="logo-item">
            <a :href="item.url" target="_blank" :title="item.name">
              <img class="img-responsive" :src="item.img" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
// TODO：JXU1NzI4JXU2NzJDJXU0RTFBJXU2NDFDJXU3RDIyc2hvd1N1cHBvcnRFdmVudCV1RkYwQyV1NjdFNSV1NzcwQiV1NjcyQyV1NjVCOSV1NkNENSV1NzY4NCV1ODlFNiV1NTNEMSV1N0M3QiV1NTc4Qg==
import { ref, reactive, onMounted } from 'vue';
import { MessagePlugin, NotifyPlugin } from 'tdesign-vue-next';
import { setting, analyze } from '@/lib/dexie';
import zy from '@/lib/site/tools';

import logoIqiyi from '@/assets/iqiyi.png';
import logoLe from '@/assets/le.png';
import logoVqq from '@/assets/vqq.png';
import logoYouku from '@/assets/youku.png';
import logoMgtv from '@/assets/mgtv.png';
import logoSohu from '@/assets/sohu.png';
import logoPptv from '@/assets/pptv.png';
import logoBilibili from '@/assets/bilibili.png';

const isSupport = ref(false);
const urlTitle = ref(); // 播放地址的标题
const analysisApi = ref([]); // 解析接口api列表
const analysisApiLoading = ref(true);
const selectAnalysisApi = ref(); // 选择的解析接口
const analysisUrl = ref(); // 输入需要解析地址
const url = ref(); // 解析接口+需解析的地址
const iframeRef = ref(); // iframe dom节点
const key = new Date().getTime(); // 解决iframe不刷新问题
const VIDEOSITES = reactive([
  {
    url: 'https://www.iqiyi.com/',
    name: '爱奇艺',
    img: logoIqiyi,
  },
  {
    url: 'https://film.qq.com/',
    name: '腾讯视频',
    img: logoVqq,
  },
  {
    url: 'https://vip.youku.com/',
    name: '优酷视频',
    img: logoYouku,
  },
  {
    url: 'https://www.mgtv.com/vip/',
    name: '芒果tv',
    img: logoMgtv,
  },
  {
    url: 'https://vip.le.com/',
    name: '乐视视频',
    img: logoLe,
  },
  {
    url: 'https://film.sohu.com/',
    name: '搜狐视频',
    img: logoSohu,
  },
  {
    url: 'https://www.bilibili.com/',
    name: 'Bilibili',
    img: logoBilibili,
  },
  {
    url: 'https://www.pptv.com/',
    name: 'PPTV',
    img: logoPptv,
  },
]); // 视频网站列表

onMounted(() => {
  getAnalysisApi();
});

// 获取解析接口及默认接口
const getAnalysisApi = async () => {
  await analyze.all().then((res) => {
    analysisApi.value = res.filter((item) => item.isActive);
    if (res) analysisApiLoading.value = false;
  });
  await setting.get('defaultAnalyze').then((res) => {
    selectAnalysisApi.value = res;
  });
  await setting.get('analyzeSupport').then((res) => {
    isSupport.value = res;
  });
};

// 解析
const analysisEvent = async () => {
  if (selectAnalysisApi.value && analysisUrl.value) {
    urlTitle.value = await zy.getAnalysizeTitle(analysisUrl.value);
    url.value = `${selectAnalysisApi.value}${analysisUrl.value}`;

    NotifyPlugin.info({
      title: '提醒',
      content: '正在加载当前视频，如遇解析失败请切换线路!',
      duration: 5000,
    });
  } else {
    MessagePlugin.error('请选择解析接口或输入需要解析的地址');
  }
};

const showSupportEvent = async () => {
  isSupport.value = !isSupport.value;
  await setting.update({
    analyzeSupport: isSupport.value,
  });
};
</script>

<style lang="less" scoped>
@import '@/style/variables';
@import '@/style/index.less';

.analysis-container {
  width: 100%;
  height: calc(100vh - var(--td-comp-size-l));
  .analysis-main {
    .analysis-main-header {
      line-height: 42px;
      padding-right: 32px;
      font-weight: 500;
    }
    .analysis-main-play {
      .analysis-play-box-show {
        height: calc(100vh - 10em);
      }
      .analysis-play-box-hidden {
        height: calc(100vh - 15em);
      }
      .analysis-play-box {
        width: 100%;
        background-color: #f5f5f7;
        border-radius: 10px;
      }
      .analysis-setting {
        &-group {
          position: relative;
          height: 40px;
          padding: 0;
          border-radius: 20px;
          background-color: #f5f5f7;
          :deep(.t-input-adornment__prepend) {
            border-radius: 20px 0 0 20px;
            background-color: rgba(0, 0, 0, 0);
            .t-input {
              border: none;
              outline: none;
            }
            .t-input--focused {
              box-shadow: none;
              color: none;
            }
          }
          .analysis-url {
            overflow: visible;
            outline: none;
            border: 0;
            background: none;
            width: 100%;
            font-size: 15px;
            line-height: 40px;
            color: #99999a;
          }
          :deep(.t-input-adornment__append) {
            background: linear-gradient(90deg, var(--td-brand-color-4), var(--td-brand-color));
            border-radius: 20px;
            .analysis-play {
              cursor: pointer;
              display: inline-block;
              width: 82px;
              .analysis-tip {
                display: block;
                color: hsl(0deg 0% 0% / 60%);
                font-size: 15px;
                line-height: 40px;
                text-align: center;
              }
            }
          }
        }
      }
    }
    .analysis-main-bottom {
      .support-title {
        .support-separator {
          border: 0.1rem solid var(--td-brand-color);
          border-radius: var(--td-radius-default);
        }
        .support-tip {
          margin-left: 5px;
          display: inline-block;
          font-weight: 500;
          text-align: left;
          line-height: 40px;
        }
      }
      .support-platform {
        display: flex;
      }
      .logo-item {
        margin-right: 8px;
        border-radius: var(--td-radius-default);
        background: var(--td-text-color-anti);
        img {
          width: 80px;
        }
      }
    }
  }
}
:root[theme-mode='dark'] {
  .analysis-play-box {
    background-color: var(--td-bg-color-container) !important;
  }
  .analysis-setting-group {
    background-color: var(--td-bg-color-container) !important;
  }
}
</style>
