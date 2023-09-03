<template>
  <t-dialog v-model:visible="formVisible" width="796px" placement="center" :footer="false">
    <template #body>
      <div class="detail-container">
        <div class="plist-body">
          <div class="detail-title clearfix">
            <div class="detail-info">
              <div class="title">
                <div v-show="info.vod_name" class="name">{{ info.vod_name }}</div>
                <div v-show="info.vod_douban_score" class="rate">
                  · {{
                    info.vod_douban_score === '0.0' && info.vod_score === '0.0'
                      ? '暂无评分'
                      : info.vod_douban_score === '0.0'
                      ? info.vod_score
                      : info.vod_douban_score
                    }}
                </div>
              </div>
              <div class="desc">
                <t-space size="small" class="tag-items">
                  <t-tag v-show="info.vod_type" shape="round" class="tag-item">{{ info.vod_type }}</t-tag>
                  <t-tag v-show="info.vod_area" shape="round" class="tag-item">{{ info.vod_area }}</t-tag>
                  <t-tag v-show="info.vod_lang" shape="round" class="tag-item">{{ info.vod_lang }}</t-tag>
                  <t-tag v-show="info.vod_year" shape="round" class="tag-item">{{ info.vod_year }}</t-tag>
                  <t-tag v-show="info.vod_note" shape="round" class="tag-item">{{ info.vod_note }}</t-tag>
                </t-space>
              </div>
            </div>
            <div class="binge">
              <div v-if="isBinge" class="video-subscribe-text" @click="bingeEvnet">
                <t-space :size="8">
                  <heart-icon size="1.2em" class="icon" />
                  <span class="tip">追</span>
                </t-space>
              </div>
              <div v-else class="video-subscribe-text" @click="bingeEvnet">
                <span class="tip">在追</span>
              </div>
            </div>
          </div>
          <div class="intro-wrap">
            <div class="poster">
              <t-image
                class="card-main-item"
                :src="info.vod_pic"
                :style="{ width: '100px', height: '150px', borderRadius: '8px' }"
                :lazy="true"
                fit="cover"
              />
            </div>
            <div class="content-wrap">
              <div class="introduce-items">
                <div v-show="info.vod_director" class="director introduce-item">
                  <span class="title">导演：</span>
                  <div class="info">{{ info.vod_director }}</div>
                </div>
                <div v-show="info.vod_actor" class="actor introduce-item">
                  <span class="title">主演：</span>
                  <div class="info">{{ info.vod_actor }}</div>
                </div>
                <div v-show="info.vod_content" class="des introduce-item">
                  <span class="title">摘要：</span>
                  <div class="info">
                    <span v-html="filterContent(info.vod_content)" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="plist-listbox">
          <div class="box-anthology-header">
            <h4 class="box-anthology-title">选集</h4>
            <div class="box-anthology-reverse-order" @click="reverseOrderEvent">
              <order-descending-icon v-if="reverseOrder" size="1.3em" />
              <order-ascending-icon v-else size="1.3em" />
            </div>
          </div>
          <div class="box-anthology-items">
            <t-tabs v-model="selectPlaySource" class="film-tabs">
              <t-tab-panel v-for="(value, key, index) in season" :key="index" :value="key">
                <template #label> {{ key }} </template>
                <div>
                  <t-space break-line size="small" align="center">
                    <t-tag
                      v-for="item in value"
                      :key="item"
                      class="tag"
                      :class="{
                        select:
                          formatName(item) ===
                            (dataHistory.videoIndex ? dataHistory.videoIndex : selectPlayIndex) &&
                          (dataHistory.siteSource ? dataHistory.siteSource : selectPlaySource) === key,
                      }"
                      @click="gotoPlay(item)"
                    >
                      {{ formatName(item) }}
                    </t-tag>
                  </t-space>
                </div>
              </t-tab-panel>
            </t-tabs>
          </div>
        </div>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import _ from 'lodash';
import {
  HeartIcon,
  OrderAscendingIcon,
  OrderDescendingIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';
import moment from 'moment';

import { history, star } from '@/lib/dexie';
import { usePlayStore } from '@/store';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
  site: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const storePlayer = usePlayStore();
const formVisible = ref(false);
const info = ref(props.data);
const formData = ref(props.site);
const isBinge = ref(true); // true未收藏 false收藏
const recommendationsList = ref([]);
const reverseOrder = ref(true); // true 正序 false 倒序
const season = ref(); // 选集
const selectPlaySource = ref(); // 选择的播放源
const selectPlayIndex = ref();
const dataHistory = ref({}); // 历史
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
    recommendationsList.value = [];
    isBinge.value = true;
    if (val) getBinge();
    if (val) getHistoryInfo();
    if (val) getDetailInfo();
  },
);
watch(
  () => props.data,
  (val) => {
    info.value = val;
  },
);
watch(
  () => props.site,
  (val) => {
    formData.value = val;
  },
);

// 调用本地播放器 + 历史
const gotoPlay = async (e) => {
  const [index, url] = e.split('$');
  selectPlayIndex.value = index;
  console.log(url)
  if (url.startsWith('http') && (url.indexOf('mp4') > -1 || url.indexOf('m3u8') > -1 || url.indexOf('flv') > -1)) {
    const playerType = storePlayer.getSetting.broadcasterType;
    if (playerType === 'iina') window.open(`iina://weblink?url=${url}`, '_self');
    else if (playerType === 'potplayer') window.open(`potplayer://${url}`, '_self');

    getHistoryInfo(true);
  } else {
    MessagePlugin.info('当前选择的非正常播放链接, 无法调用系统播放器');
  };
};

// 在追
const bingeEvnet = async () => {
  isBinge.value = !isBinge.value;
  const { key } = formData.value;
  const id = info.value.vod_id;
  const db = await star.find({ siteKey: key, videoId: id });
  console.log(db);
  if (!isBinge.value) {
    const doc = {
      siteKey: key,
      videoId: id,
      videoImage: info.value.vod_pic,
      videoName: info.value.vod_name,
    };
    if (!db) {
      star
        .add(doc)
        .then((res) => {
          console.log(res);
          MessagePlugin.success('加入追剧列表');
        })
        .catch((error) => {
          MessagePlugin.error(`加入追剧列表失败:${error}`);
        });
    }
  } else star.remove(db.id);
};

// 获取是否收藏
const getBinge = async () => {
  console.log(formData.value.key, info.value.vod_id);
  await star.find({ siteKey: formData.value.key, videoId: info.value.vod_id }).then((res) => {
    if (res) isBinge.value = false;
  });
};

// 选择倒序
const reverseOrderEvent = () => {
  reverseOrder.value = !reverseOrder.value;
  seasonReverseOrder();
};

// 选集排序
const seasonReverseOrder = () => {
  if (reverseOrder.value) {
    console.log('正序');
    season.value = JSON.parse(JSON.stringify(info.value.fullList));
  } else {
    console.log('倒序');
    for (const key in season.value) {
      season.value[key].reverse();
    }
  }
};

// 格式化剧集名称
const formatName = (e) => {
  const [first] = e.split('$');
  return first.includes('http') ? '正片' : first;
};

// 获取历史
const getHistoryInfo = async (type = false) => {
  try {
    const { key } = formData.value;
    const id = info.value.vod_id;
    const res = await history.find({ siteKey: key, videoId: id });
    const doc = {
      date: moment().format('YYYY-MM-DD'),
      siteKey: key,
      siteSource: selectPlaySource.value,
      playEnd: false,
      videoId: id,
      videoImage: info.value.vod_pic,
      videoName: info.value.vod_name,
      videoIndex: selectPlayIndex.value,
      watchTime: 0,
      duration: null,
      skipTimeInStart: 30,
      skipTimeInEnd: 30,
    };
    if (res) {
      if (!type) {
        selectPlaySource.value = res.siteSource;
        selectPlayIndex.value = res.videoIndex;
      };
      if (res.siteSource !== selectPlaySource.value || res.videoIndex !== selectPlayIndex.value) {
        await history.update(res.id, doc);
        dataHistory.value = { ...doc, id: res.id };
      } else {
        dataHistory.value = { ...res };
      }
    } else {
      await history.add(doc);
    }
  } catch (error) {
    console.error(error);
  }
};

// 获取播放源及剧集
const getDetailInfo = async () => {
  const videoList = info.value;
  console.log(videoList);

  // 播放源
  const playFrom = videoList.vod_play_from;
  const playSource = playFrom.split('$').filter(Boolean);
  const [source] = playSource;
  console.log(source)
  if (!selectPlaySource.value) selectPlaySource.value = source;

  // 剧集
  const playUrl = videoList.vod_play_url;
  const playUrlDiffPlaySource = playUrl.split('$$$'); // 分离不同播放源
  const playEpisodes = playUrlDiffPlaySource.map((item) =>
    item
      .replace(/\$+/g, '$')
      .split('#')
      .map((e) => {
        if (!e.includes('$')) e = `正片$${e}`;
        return e;
      }),
  );
  if (!selectPlayIndex.value) selectPlayIndex.value = playEpisodes[0][0].split('$')[0];

  // 合并播放源和剧集
  const fullList = Object.fromEntries(playSource.map((key, index) => [key, playEpisodes[index]]));

  videoList.fullList = fullList;
  info.value = videoList;
  season.value = fullList;
  seasonReverseOrder();
  console.log(info.value, season.value);
};


// 替换style
const filterContent = (item) => {
  return _.replace(item, /style\s*?=\s*?([‘"])[\s\S]*?\1/gi, '');
};

</script>

<style lang="less" scoped>
.detail-container {
  height: calc(100% - 48px);
  .plist-body {
    .detail-title {
      position: relative;
      display: flex;
      justify-content: space-between;
      box-shadow: 0 26px 40px -30px rgba(0,36,100,0.3);
      .detail-info {
        .title {
          display: flex;
          align-items: baseline;
          flex-direction: row;
          flex-wrap: nowrap;
          justify-content: flex-start;
          .name {
            position: relative;
            font-weight: 700;
            font-size: 28px;
            line-height: 28px;
            max-width: 200px;
            word-break: keep-all;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .rate {
            color: var(--td-brand-color);
            font-weight: 700;
            font-size: 14px;
            margin-right: 12px;
          }
        }
        .desc {
          margin-top: 10px;
        }
      }
      .binge {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.15);
        border-radius: 36px;
        filter: blur(0);
        width: 84px;
        height: 42px;
        z-index: 14;
      }
    }
    .intro-wrap {
      padding: 10px 0 5px 0;
      position: relative;
      width: 100%;
      font-size: 14px;
      line-height: 20px;
      display: flex;
      .poster {
        display: block;
        position: relative;
        height: 100%;
        margin-right: 12px;
        border-radius: 8px;
      }
      .content-wrap {
        height: 150px;
        overflow-x: hidden;
        overflow-y: scroll;
        .introduce-items {
          overflow: hidden;
          .introduce-item {
            margin-bottom: 12px;
            .title {
              display: block;
              float: left;
              line-height: 22px;
              height: 22px;
            }
            .info {
              line-height: 22px;
              margin-right: 12px;
              cursor: default;
            }
          }
        }
      }
    }
  }
  .plist-listbox {
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
    .box-anthology-header {
      display: flex;
      justify-content: space-between;
      .box-anthology-title {
        position: relative;
        font-size: 18px;
        line-height: 25px;
        font-weight: 600;
      }
      .box-anthology-reverse-order {
        cursor: pointer;
      }
    }
  }
}

.select {
  color: #85d46e !important;
}

.t-tabs {
  background-color: transparent;
}

:deep(.t-tabs__content) {
  max-height: 150px;
  padding: 10px 0 0 0;
  overflow-y: auto;
}
</style>
