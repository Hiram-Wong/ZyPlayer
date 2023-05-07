<template>
  <t-dialog v-model:visible="formVisible" width="80%" placement="center" :footer="false">
    <template #body>
      <div class="detail-container">
        <div class="plist-body">
          <div class="detail-title clearfix">
            <div class="title-width">
              <div v-show="info.vod_name" class="name">{{ info.vod_name }}</div>
              <div v-show="info.vod_douban_score" class="rate">
                · {{ info.vod_douban_score === '0.0' ? '暂无评分' : info.vod_douban_score }}
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
          <div class="intro-wrap">
            <div class="poster">
              <t-image
                class="card-main-item"
                :src="info.vod_pic"
                :style="{ width: '140px', height: '213px', 'border-radius': '5px' }"
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
          <t-tabs v-model="selectPlayableSource">
            <t-tab-panel v-for="(value, key, index) in videoFullList" :key="index" :value="key" :label="key">
              <div style="padding-top: 25px">
                <t-space break-line>
                  <t-tag v-for="item in value" :key="item" theme="primary" variant="outline" @click="gotoPlay(item)">
                    {{ formatName(item) }}
                  </t-tag>
                </t-space>
              </div>
            </t-tab-panel>
          </t-tabs>
        </div>
        <div v-show="recommendationsList.length != 0" class="plist-bohrecommend">
          <div class="banner">猜你喜欢</div>
          <div class="like-portrait">
            <t-space break-line>
              <div v-for="item in recommendationsList" :key="item.id" style="display: inline-block">
                <div class="card" @click="detailEvent(item)">
                  <div class="card-header">
                    <t-tag disabled size="small" variant="light-outline" theme="success">
                      <span>{{ item.vod_remarks }}</span>
                    </t-tag>
                  </div>
                  <div class="card-main">
                    <t-image
                      class="card-main-item"
                      :src="item.vod_pic"
                      :style="{ width: '100%', height: '170px', 'border-radius': '5px' }"
                      :lazy="true"
                      fit="cover"
                    />
                  </div>
                  <div class="card-footer">
                    <span class="card-footer-title">{{ item.vod_name }}</span>
                  </div>
                </div>
              </div>
            </t-space>
          </div>
        </div>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { useIpcRenderer } from '@vueuse/electron';
import _ from 'lodash';
import { HeartIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';

import { history, star } from '@/lib/dexie';
import zy from '@/lib/utils/tools';
import { usePlayStore } from '@/store';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  info: {
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

const ipcRenderer = useIpcRenderer();

const store = usePlayStore();
const selectPlayableSource = ref([]);
const formVisible = ref(false);
const info = ref(props.info);
const formData = ref(props.site);
const videoFullList = ref([]);
const isBinge = ref(true); // true未收藏 false收藏
const recommendationsList = ref([]);
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
    if (val) getDetailInfo();
    if (val) getDoubanRate();
    if (val) getDoubanRecommend();
    if (val) getbinge();
  },
);
watch(
  () => props.info,
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

// 加历史 + 去播放页面
const gotoPlay = async (item) => {
  const num = item.split('$');
  const { key } = formData.value;
  const id = info.value.vod_id;
  const db = await history.find({ siteKey: key, videoId: id });
  let historyId;
  let watchTime = 0;
  const doc = {
    date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
    siteKey: key,
    siiteSource: selectPlayableSource.value,
    playEnd: 0,
    videoId: id,
    videoImage: info.value.vod_pic,
    videoName: info.value.vod_name,
    videoIndex: num[0],
    watchTime: 0,
    duration: null,
  };
  if (db) {
    await history.update(db.id, doc);
    historyId = db.id;
    watchTime = db.watchTime;
  } else historyId = await history.add(doc);
  console.log(historyId);

  store.updateConfig({
    type: 'film',
    data: {
      url: num[1],
      title: info.value.vod_name,
      index: num[0],
      source: selectPlayableSource.value,
      id,
      historyId,
      seasons: { ...videoFullList.value },
      key: formData.value.key,
      img: info.value.vod_pic,
      watchTime,
    },
  });

  ipcRenderer.send('openPlayWindow');
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
const getbinge = async () => {
  console.log(formData.value.key, info.value.vod_id);
  await star.find({ siteKey: formData.value.key, videoId: info.value.vod_id }).then((res) => {
    if (res) isBinge.value = false;
  });
};

// 格式化剧集名称
const formatName = (e, n) => {
  // console.log(e, n);
  const num = e.split('$');
  if (num.length > 1) {
    return e.split('$')[0];
  }
  return `第${n + 1}集`;
};

// 获取播放源及剧集
const getDetailInfo = async () => {
  const videoList = info.value;

  // 播放源
  const playFrom = videoList.vod_play_from;
  const playSource = playFrom.split('$').filter((e) => e);
  // console.log(playSource)
  // selectPlayableSource.value = playSource[0];
  const [source] = playSource;
  selectPlayableSource.value = source;

  // 剧集
  const playUrl = videoList.vod_play_url;
  const playUrlDiffPlaySource = playUrl.split('$$$'); // 分离不同播放源
  const playEpisodes = [];
  _.forEach(playUrlDiffPlaySource, (item) => {
    const playContont = item
      .replace(/\$+/g, '$')
      .split('#')
      .filter((e) => e && (e.startsWith('http') || (e.split('$')[1] && e.split('$')[1].startsWith('http'))));
    playEpisodes.push(playContont);
    // startsWith(playContont, 'http') ? playEpisodes.push(`默认$${playContont}`) : playEpisodes.push(playContont);
  });
  // console.log(playEpisodes)

  // 合并播放源和剧集
  const fullList = _.zipObject(playSource, playEpisodes);
  // console.log(fullList)

  videoList.fullList = fullList;
  info.value = videoList;
  videoFullList.value = fullList;

  // console.log(fullList)
  // videoList.fullList = fullList;
  // info.value = videoList;
  // videoLists.value = fullList[0].list;
  // videoFullList.value = fullList;
  // const type = Object.prototype.toString.call(dd);
  // if (type === '[object Array]') {
  //   console.log(1)
  //   for (const i of dd) {
  //     i._t = i._t.replace(/\$+/g, '$');
  //     const ext = Array.from(
  //       new Set(
  //         ...i._t.split('#').map((e) => (e.includes('$') ? e.split('$')[1].match(/\.\w+?$/) : e.match(/\.\w+?$/))),
  //       ),
  //     ).map((e) => e.slice(1));
  //     if (ext.length && ext.length <= supportedFormats.length && ext.every((e) => supportedFormats.includes(e))) {
  //       if (ext.length === 1) {
  //         i._flag = ext[0];
  //       } else {
  //         i._flag = index ? `ZY支持-${index}` : 'ZY支持';
  //         index++;
  //       }
  //     }
  //     fullList.push({
  //       flag: i._flag,
  //       list: i._t
  //         .split('#')
  //         .filter((e) => e && (e.startsWith('http') || (e.split('$')[1] && e.split('$')[1].startsWith('http')))),
  //     });
  //   }
  // } else {
  //   fullList.push({
  //     flag: dd._flag,
  //     list: dd._t
  //       .replace(/\$+/g, '$')
  //       .split('#')
  //       .filter((e) => e && (e.startsWith('http') || (e.split('$')[1] && e.split('$')[1].startsWith('http')))),
  //   });
  // }
  // fullList.forEach((item) => {
  //   if (item.list.every((e) => e.includes('$') && /^\s*\d+\s*$/.test(e.split('$')[0])))
  //     item.list.sort((a, b) => {
  //       return a.split('$')[0] - b.split('$')[0];
  //     });
  // });
  // if (fullList.length > 1) {
  //   // 将ZY支持的播放列表前置
  //   index = fullList.findIndex((e) => supportedFormats.includes(e.flag) || e.flag.startsWith('ZY支持'));
  //   if (index !== -1) {
  //     const first = fullList.splice(index, 1);
  //     fullList = first.concat(fullList);
  //   }
  // }
  // videoList.fullList = fullList;
  // info.value = videoList;
  // videoLists.value = fullList[0].list;
  // videoFullList.value = fullList;
  // console.log(fullList);
};

// 获取豆瓣评分
const getDoubanRate = async () => {
  const rate = info.value.vod_douban_score.trim();
  const id = info.value.vod_douban_id;
  if (rate && rate === '0.0') {
    const name = info.value.vod_name;
    const { year } = info.value;
    info.value.rate = await zy.doubanRate(id, name, year);
  }
};

// 获取豆瓣影片推荐
const getDoubanRecommend = async () => {
  const { key } = formData.value;
  const name = info.value.vod_name;
  const year = info.value.vod_year;
  const id = info.value.vod_douban_id;
  await zy.doubanRecommendations(id, name, year).then((resName) => {
    _.forEach(resName, async (element) => {
      await zy.searchFirstDetail(key, element).then((res) => {
        if (res) {
          if (recommendationsList.value.length < 8) recommendationsList.value.push(res);
        }
      });
    });
  });
};

// 替换style
const filterContent = (item) => {
  return _.replace(item, /style\s*?=\s*?([‘"])[\s\S]*?\1/gi, '');
};

// 推荐详情-刷新数据
const detailEvent = (event) => {
  info.value = event;
  recommendationsList.value = [];
  getDetailInfo();
  getDoubanRate();
  getDoubanRecommend();
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';
@import '@/style/index.less';

.detail-container {
  .plist-body {
    .clearfix {
      position: relative;
      padding: 0 0 20px 0;
    }
    .detail-title {
      .title-width {
        margin: 0 0 10px;
        .name,
        .rate {
          display: inline-block;
        }
        .name {
          position: relative;
          font-weight: 700;
          font-size: 28px;
          line-height: 32px;
          max-width: 50%;
          word-break: keep-all;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .rate {
          color: #ff008c;
          font-weight: 700;
          margin-right: 12px;
        }
        .binge {
          position: absolute;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.15);
          border-radius: 36px;
          filter: blur(0);
          top: 12px;
          right: 12px;
          width: 84px;
          height: 42px;
          z-index: 14;
        }
      }
      .tags {
        margin: 0 0 20px;
      }
    }
    .intro-wrap {
      position: relative;
      height: 213px;
      width: 100%;
      font-size: 14px;
      line-height: 20px;
      // color: hsla(0, 0%, 100%, 0.87);
      color: hsla(0, 0%, 0%, 0.87);
      .poster {
        display: block;
        position: relative;
        float: left;
        height: 100%;
        margin-right: 12px;
        background-size: 100%;
        background-color: #25252b;
        width: 140px;
        border-radius: 8px;
      }
      .content-wrap {
        height: 100%;
        overflow-x: hidden;
        overflow-y: scroll;
        .introduce-items {
          overflow: hidden;
          .introduce-item {
            margin-bottom: 12px;
            .title {
              color: hsla(100, 100%, 0%, 0.38);
              display: block;
              float: left;
              line-height: 22px;
              height: 22px;
            }
            .info {
              color: hsla(100, 100%, 0%, 0.87);
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
    display: block;
  }
  .plist-bohrecommend {
    padding-top: 40px;
    .banner {
      font-size: 24px;
      line-height: 24px;
      height: 24px;
      font-weight: 600;
      margin: 8px 0 16px;
      color: hsla(100, 100%, 0%, 0.8);
    }
    .like-portrait {
      .card {
        box-sizing: border-box;
        width: 125px;
        height: 210px;
        position: relative;
        cursor: pointer;
        .card-header {
          color: #fbfbfb;
          position: absolute;
          z-index: 2222;
          .t-tag {
            position: absolute;
            top: 5px;
            left: 5px;
            font-size: 10px;
          }
        }
        .card-main {
          width: 100%;
        }
        .card-footer {
          height: 52px;
          padding-top: 10px;
          overflow: hidden;
          height: auto;
          line-height: 26px;
          .card-footer-title {
            height: auto;
            line-height: 26px;
            font-size: 14px;
            font-weight: 700;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
          }
        }
      }
    }
  }
}

:root[theme-mode='dark'] {
  .detail-container {
    .plist-body {
      .binge {
        background: rgba(255, 255, 255, 0.15);
      }
      .intro-wrap {
        color: hsla(0, 0%, 100%, 0.87);
        .content-wrap {
          .introduce-item {
            .title {
              color: hsla(0, 0%, 100%, 0.38);
            }
            .info {
              color: hsla(0, 0%, 100%, 0.87);
            }
          }
        }
      }
    }
    .plist-bohrecommend {
      .banner {
        color: hsla(0, 0%, 100%, 0.8);
      }
    }
  }
}
</style>
