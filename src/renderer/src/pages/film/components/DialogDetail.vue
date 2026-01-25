<template>
  <t-dialog
    v-model:visible="formVisible"
    show-in-attached-element
    :attach="`.${attachContent}`"
    width="70%"
    placement="center"
    destroy-on-close
    lazy
    :footer="false"
  >
    <template #header>
      {{ $t('common.info') }}
    </template>
    <template #body>
      <div class="detail view-container">
        <div class="plist-body">
          <div class="left">
            <t-image
              class="card-main-item"
              :src="infoConf.vod_pic"
              fit="cover"
              shape="round"
              :style="{ width: '120px', height: '100%' }"
              :lazy="true"
              :loading="renderDefaultLazy"
              :error="renderDefaultLazy"
            />
          </div>
          <div class="right">
            <div class="info">
              <p class="title txthide txthide1">{{ infoConf.vod_name }}</p>
              <p class="info-item txthide txthide1">
                <span class="name">{{ $t('pages.film.info.release') }}: </span>
                <span class="role">{{ infoConf.vod_year || $t('common.unknown') }}</span>
              </p>
              <p class="info-item txthide txthide1">
                <span class="name">{{ $t('pages.film.info.type') }}: </span>
                <span class="role">{{ infoConf.type_name || $t('common.unknown') }}</span>
              </p>
              <p class="info-item txthide txthide1">
                <span class="name">{{ $t('pages.film.info.area') }}: </span>
                <span class="role">{{ infoConf.vod_area || $t('common.unknown') }}</span>
              </p>
            </div>
            <div class="add-box" @click="switchStar">
              <div class="add">
                <heart-filled-icon v-if="starData.id" class="icon" />
                <heart-icon v-else class="icon" />
              </div>
            </div>
          </div>
        </div>
        <div class="plist-listbox">
          <div class="header">
            <div class="left">
              <h4 class="box-anthology-title">{{ $t('pages.player.film.anthology') }}</h4>
              <div v-show="activeAnalyzeList.length" class="box-anthology-analyze">
                <t-dropdown placement="bottom" :max-height="250">
                  <t-button size="small" theme="default" variant="text" auto-width>
                    <span>{{ $t('pages.parse.title') }}</span>
                    <template #suffix>
                      <chevron-down-icon size="16" />
                    </template>
                  </t-button>
                  <t-dropdown-menu>
                    <t-dropdown-item
                      v-for="item in activeAnalyzeList"
                      :key="item.id"
                      :active="item.id === active.analyzeId"
                      @click="handleSwitchParse(item.id)"
                    >
                      <span>{{ item.name }}</span>
                    </t-dropdown-item>
                  </t-dropdown-menu>
                </t-dropdown>
              </div>
            </div>
            <div class="right">
              <div class="box-anthology-reverse-order" @click="reverseOrderEvent">
                <order-descending-icon v-if="active.reverseOrder" size="1.2em" />
                <order-ascending-icon v-else size="1.2em" />
              </div>
            </div>
          </div>
          <div class="box-anthology-item">
            <div v-if="lineList.length > 1" class="box-anthology-header">
              <title-menu :list="lineList" :active="active.filmSource" class="nav" @change="handleSwitchLine" />
            </div>
            <div class="box-anthology-content">
              <div class="grid-wrap">
                <div
                  v-for="(item, index) in activeSessionList"
                  :key="index"
                  class="item-wrap"
                  :class="[`${item.text}$${item.link}` === active.filmIndex ? 'is-active' : '']"
                  @click="handleSwitchSeason(item)"
                >
                  <div class="list-item">
                    <t-tooltip :content="item.text">
                      <div class="title txthide txthide1">{{ reverseOrderIndex(index) }}</div>
                    </t-tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <t-loading :attach="`.${attachContent}`" size="medium" :loading="active.loading" />
    </template>
  </t-dialog>
</template>
<script setup lang="tsx">
import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import {
  isArray,
  isArrayEmpty,
  isHttp,
  isNil,
  isObject,
  isObjectEmpty,
  isPositiveFiniteNumber,
} from '@shared/modules/validate';
import type { ICmsInfo, ICmsInfoEpisode } from '@shared/types/cms';
import type { IModels } from '@shared/types/db';
import {
  ChevronDownIcon,
  HeartFilledIcon,
  HeartIcon,
  OrderAscendingIcon,
  OrderDescendingIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref, watch } from 'vue';

import { fetchCmsPlay, fetchCmsProxy } from '@/api/film';
import { addHistory, addStar, delStar, findHistory, findStar, putHistory, putStar } from '@/api/moment';
import { fetchAnalyzeActive, fetchParse } from '@/api/parse';
import { setProxy } from '@/api/proxy';
import { cdpSnifferMedia } from '@/api/system';
import LazyBg from '@/components/lazy-bg/index.vue';
import { mediaUtils } from '@/components/multi-player';
import TitleMenu from '@/components/title-menu/index.vue';
import { attachContent } from '@/config/global';
import { t } from '@/locales';
import { usePlayerStore } from '@/store';
import { proxyApi } from '@/utils/env';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  info: {
    type: Object,
    default: () => ({}),
  },
  extra: {
    type: Object,
    default: () => ({ active: {}, setting: {} }),
  },
});

const emits = defineEmits(['update:visible']);

const storePlayer = usePlayerStore();

const formVisible = ref(false);

const infoConf = ref<Partial<ICmsInfo>>(props.info);
const extraConf = ref(props.extra);

const starData = ref<IModels['star']>({} as IModels['star']);
const historyData = ref<IModels['history']>({} as IModels['history']);

const lineList = ref<{ type_id: string; type_name: string }[]>([]);

const analyzeConfig = ref({
  default: {} as IModels['analyze'],
  list: [] as IModels['analyze'][],
});

const active = ref({
  filmSource: '',
  filmIndex: '',
  analyzeId: '',
  reverseOrder: true,
  loading: false,
});

const activeAnalyzeList = computed(() => {
  const flag = active.value.filmSource;
  const resp = analyzeConfig.value.list.filter((item: IModels['analyze']) => (item.flag || []).includes(flag));
  return resp;
});

const activeSessionList = computed(() => {
  const flag = active.value.filmSource;
  const resp = infoConf.value.vod_episode?.[flag] || [];
  return resp;
});

watch(
  () => formVisible.value,
  (val) => {
    emits('update:visible', val);

    if (val) setup();
    else defaultConfig();
  },
);
watch(
  () => props.visible,
  (val) => (formVisible.value = val),
);
watch(
  () => props.info,
  (val) => (infoConf.value = val),
  { deep: true },
);
watch(
  () => props.extra,
  (val) => (extraConf.value = val),
  { deep: true },
);

const renderDefaultLazy = () => <LazyBg class="render-icon" />;

const createStarDoc = (item: ICmsInfo, siteKey: string) => ({
  type: 1,
  relateId: siteKey,
  videoId: item.vod_id,
  videoImage: item.vod_pic,
  videoName: item.vod_name,
  videoType: item.type_name,
  videoRemarks: item.vod_remarks,
});

const getStarData = async () => {
  try {
    const resp = await findStar({ relateId: extraConf.value.active.key, videoId: infoConf.value.vod_id, type: 1 });
    starData.value = isNil(resp?.id) ? {} : resp;
  } catch (error) {
    console.error('Get Star Data Error:', error);
    starData.value = {};
  }
};

const saveStarData = async () => {
  const id = starData.value?.id;
  const doc = createStarDoc(infoConf.value as ICmsInfo, extraConf.value.active.key);

  try {
    const resp = isNil(id) ? await addStar(doc) : await putStar({ id: [id], doc });
    if (isArray(resp) && !isArrayEmpty(resp) && !isNil(resp[0]?.id)) {
      starData.value = resp[0];
    } else {
      starData.value = {};
    }
  } catch (error) {
    console.error('Save Star Data Error:', error);
    starData.value = {};
  }
};

const delStarDate = async () => {
  const id = starData.value?.id;

  try {
    await delStar({ id: [id] });
  } catch (error) {
    console.error('Delete Star Data Error:', error);
  } finally {
    starData.value = {};
  }
};

const switchStar = async () => {
  const id = starData.value?.id;

  isNil(id) ? await saveStarData() : await delStarDate();
};

const createHistoryDoc = (item: ICmsInfo, siteKey: string) => ({
  type: 1,
  relateId: siteKey,
  siteSource: active.value.filmSource,
  playEnd: false,
  videoId: item.vod_id,
  videoImage: item.vod_pic,
  videoName: item.vod_name,
  videoIndex: active.value.filmIndex,
  watchTime: 0,
  duration: 0,
  skipTimeInStart: 90,
  skipTimeInEnd: 90,
});

const getHistoryData = async () => {
  try {
    const resp = await findHistory({ relateId: extraConf.value.active.key, videoId: infoConf.value.vod_id, type: 1 });
    historyData.value = isNil(resp?.id) ? {} : resp;
  } catch (error) {
    console.error('Get History Data Error:', error);
    historyData.value = {};
  }
};

const saveHistoryData = async () => {
  const doc = createHistoryDoc(infoConf.value as ICmsInfo, extraConf.value.active.key);

  const id = historyData.value?.id;
  if (!isNil(id) && isPositiveFiniteNumber(historyData.value.watchTime)) doc.watchTime = historyData.value.watchTime;
  if (!isNil(id) && isPositiveFiniteNumber(historyData.value.duration)) doc.duration = historyData.value.duration;
  if (!isNil(id) && isPositiveFiniteNumber(historyData.value.skipTimeInStart))
    doc.skipTimeInStart = historyData.value.skipTimeInStart;
  if (!isNil(id) && isPositiveFiniteNumber(historyData.value.skipTimeInEnd))
    doc.skipTimeInEnd = historyData.value.skipTimeInEnd;

  try {
    const resp = isNil(id) ? await addHistory(doc) : await putHistory({ id: [id], doc });
    if (isArray(resp) && !isArrayEmpty(resp) && !isNil(resp[0]?.id)) {
      historyData.value = resp[0];
    } else {
      historyData.value = {};
    }
  } catch (error) {
    console.error('Save History Data Error:', error);
    historyData.value = {};
  }
};

const reverseOrderIndex = (current: number) => {
  const total = activeSessionList.value.length;
  const type = active.value.reverseOrder;

  if (!isPositiveFiniteNumber(current) || !isPositiveFiniteNumber(total)) return 1;
  if (current >= total) return 1;

  return type ? current + 1 : total - current;
};

const handleSwitchLine = (id: string) => {
  active.value.filmSource = id;
};

const handleSwitchSeason = (item: ICmsInfoEpisode) => {
  active.value.filmIndex = `${item.text}$${item.link}`;

  callPlay(item);
};

const handleSwitchParse = (id: string) => {
  active.value.analyzeId = id;

  if (active.value.filmIndex) {
    const [text, link] = active.value.filmIndex.split('$');
    callPlay({ text, link });
  }
};

const reverseOrderEvent = () => {
  infoConf.value.vod_episode = Object.fromEntries(
    Object.entries(infoConf.value.vod_episode!).map(([key, arr]) => [key, arr.toReversed()]),
  );

  active.value.reverseOrder = !active.value.reverseOrder;
};

const getAnalyzeConfig = async () => {
  try {
    const resp = await fetchAnalyzeActive();
    if (resp?.default) {
      analyzeConfig.value.default = resp.default;
      active.value.analyzeId = resp.default.id;
    }
    if (resp?.list) {
      analyzeConfig.value.list = resp.list;
    }
  } catch (error) {
    console.error(`Failed to get analyze config:`, error);
  }
};

const setup = async () => {
  const episode = infoConf.value.vod_episode;
  if (!isObject(episode) || isObjectEmpty(episode)) return;

  const episodeKeys = Object.keys(episode);
  let filmSource = episodeKeys[0];
  let flimEpisode = episode[filmSource]?.[0];

  if (!isObject(flimEpisode) || isObjectEmpty(flimEpisode)) return;
  let filmIndex = `${flimEpisode.text}$${flimEpisode.link}`;

  lineList.value = episodeKeys.map((key) => ({ type_id: key, type_name: key }));

  await getHistoryData();
  if (historyData.value.siteSource && episode[historyData.value.siteSource]) filmSource = historyData.value.siteSource;
  if (historyData.value.videoIndex) filmIndex = historyData.value.videoIndex;
  active.value.filmSource = filmSource;
  active.value.filmIndex = filmIndex;

  flimEpisode = { text: filmIndex.split('$')[0], link: filmIndex.split('$')[1] };

  await getAnalyzeConfig();

  getStarData();
};

const getDirectPlayUrl = async (
  item: ICmsInfoEpisode,
): Promise<{
  url: string;
  headers?: Record<string, any>;
  quality?: Array<string | number>;
  mediaType: string;
}> => {
  const playRes = await fetchCmsPlay({
    uuid: extraConf.value.active.id,
    play: item.link,
    flag: active.value.filmSource,
  });

  if (!playRes.url) throw new Error('No Play URL');

  const checkPlayable = async (
    url: string,
    headers?: Record<string, any>,
  ): Promise<{
    url: string;
    headers?: Record<string, any>;
    mediaType: string;
  } | null> => {
    const mediaType = await mediaUtils.checkMediaType(url, headers);
    if (isNil(mediaType)) return null;
    return { url, headers, mediaType };
  };

  // Direct play
  if (playRes.parse === 0 && playRes.jx !== 1) {
    if (playRes.url.startsWith(proxyApi)) {
      const { searchParams } = new URL(playRes.url);
      const proxyParams = Object.fromEntries(searchParams.entries());
      const proxyData = await fetchCmsProxy({ uuid: extraConf.value.active.id, ...proxyParams });
      await setProxy({ url: proxyParams.url, text: proxyData });
    }

    const direct = await checkPlayable(playRes.url, playRes.headers);
    if (!isNil(direct)) return { ...direct, quality: playRes.quality };
  }

  // Parse play
  if (playRes.jx === 1 || !isArrayEmpty(activeAnalyzeList.value)) {
    const parse = activeAnalyzeList.value.find((item: IModels['analyze']) => item.id === active.value.analyzeId);
    if (isNil(parse)) throw new Error('No Active Analyze');

    const parseResp = await fetchParse({ id: parse.id, url: item.link });
    const parsed = await checkPlayable(parseResp.url, parseResp.headers);
    if (parsed) return parsed;
  }

  // Sniffer play
  if (isHttp(item.link)) {
    const sniffResp = await cdpSnifferMedia({
      url: item.link,
      options: {
        runScript: playRes.script.runScript,
        initScript: playRes.script.initScript,
        customRegex: playRes.script.customRegex,
        snifferExclude: playRes.script.snifferExclude,
        headers: playRes.headers,
      },
    });
    const sniffed = await checkPlayable(sniffResp.url, playRes.headers);
    if (!isNil(sniffed)) return sniffed;
  }

  throw new Error('No Play URL');
};

const callPlay = async (item: ICmsInfoEpisode) => {
  active.value.loading = true;

  try {
    const res = await getDirectPlayUrl(item);

    const player = storePlayer.player;
    window.electron.ipcRenderer.invoke(IPC_CHANNEL.CALL_PLAYER, player.external, res.url);

    await saveHistoryData();
  } catch (error) {
    console.error(error);

    const msg = (error as Error).message;
    if (msg === 'No Play URL') {
      MessagePlugin.warning(t('pages.player.message.noPlayUrl'));
    } else if (msg === 'No Active Analyze') {
      MessagePlugin.warning(t('pages.player.message.noActiveAnalyze'));
    } else {
      MessagePlugin.error(`${t('common.error')}: ${msg}`);
    }
  } finally {
    active.value.loading = false;
  }
};

const defaultConfig = () => {
  active.value.filmSource = '';
  active.value.filmIndex = '';
  active.value.analyzeId = '';
  active.value.reverseOrder = true;

  historyData.value = {};
  starData.value = {};

  analyzeConfig.value = { default: {}, list: [] };
};
</script>
<style lang="less" scoped>
.view-container {
  display: flex;
  flex-direction: column;
  gap: var(--td-size-4);

  .plist-body {
    height: 165px;
    display: flex;
    gap: var(--td-size-4);

    .left {
      width: 120px;
      display: block;
      position: relative;
      height: 100%;
    }

    .right {
      flex: 1;
      position: relative;

      .info {
        .title {
          margin-bottom: var(--td-comp-margin-s);
          color: var(--td-text-color-primary);
          font-weight: 700;
          font-size: 26px;
          line-height: 36px;
        }

        .info-item {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
          line-height: 24px;
          color: var(--td-text-color-secondary);
        }
      }

      .add-box {
        position: absolute;
        bottom: 0;

        .add {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--td-text-color-secondary);
          background-color: var(--td-bg-color-component);
          border-radius: var(--td-radius-circle);
          width: var(--td-comp-size-l);
          height: var(--td-comp-size-l);

          &:hover {
            color: var(--td-text-color-primary);
          }

          .icon {
            width: var(--td-comp-size-xxs);
            height: var(--td-comp-size-xxs);
          }
        }
      }
    }
  }

  .plist-listbox {
    display: flex;
    flex-direction: column;
    gap: var(--td-size-4);

    .header {
      font-size: 16px;
      line-height: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--td-text-color-primary);

      .left {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-start;
        align-items: flex-end;

        .mg-left {
          margin-left: var(--td-comp-margin-xs);
        }

        .box-anthology-title {
          white-space: nowrap;
          position: relative;
          font-size: 18px;
          line-height: 25px;
          font-weight: 600;
        }

        .box-anthology-line,
        .box-anthology-analyze {
          :deep(.t-button) {
            padding: 0;
          }

          :deep(.t-button--variant-text) {
            .t-button__suffix {
              margin-left: var(--td-comp-margin-xxs);
            }

            .t-button__text {
              &::before {
                content: '';
                width: 1px;
                margin: 0 var(--td-comp-margin-xs);
                background: linear-gradient(180deg, transparent, var(--td-border-level-1-color), transparent);
              }
            }

            &:hover,
            &:focus-visible {
              background-color: transparent !important;
              border-color: transparent !important;
              color: var(--td-brand-color);
            }
          }
        }
      }

      .right {
        .box-anthology-reverse-order {
          cursor: pointer;
        }
      }
    }

    // .tag-container {
    //   display: flex;
    //   flex-wrap: wrap;
    //   margin-top: var(--td-comp-margin-s);

    //   .mainVideo-num {
    //     position: relative;
    //     width: 41px;
    //     font-size: 18px;
    //     height: 41px;
    //     line-height: 41px;
    //     border-radius: 8px;
    //     text-align: center;
    //     cursor: pointer;
    //     margin-bottom: 4px;
    //     margin-right: 4px;
    //     box-shadow: 0 2px 8px 0 rgb(0 0 0 / 8%);

    //     &:hover {
    //       background-image: linear-gradient(var(--td-brand-color-2), var(--td-brand-color-3));
    //     }

    //     &::before {
    //       content: '';
    //       display: block;
    //       position: absolute;
    //       inset: 1px;
    //       border-radius: 8px;
    //       background-color: var(--td-bg-container);
    //       z-index: 2;
    //     }

    //     .mainVideo_inner {
    //       position: absolute;
    //       inset: 1px;
    //       border-radius: 8px;
    //       z-index: 3;
    //       overflow: hidden;
    //       background-image: linear-gradient(hsl(0deg 0% 100% / 4%), hsl(0deg 0% 100% / 6%));

    //       .playing {
    //         display: none;
    //         min-width: 10px;
    //         height: 8px;
    //         background: url('@/assets/player/playon-green.gif') no-repeat;
    //       }
    //     }
    //   }

    //   .mainVideo-selected {
    //     color: var(--td-brand-color);
    //     background-image: linear-gradient(hsl(0deg 0% 100% / 10%), hsl(0deg 0% 100% / 6%));

    //     // box-shadow: 0 2px 8px 0 rgba(0,0,0,.08), inset 0 4px 10px 0 rgba(0,0,0,.14);
    //     .playing {
    //       display: inline-block !important;
    //       position: absolute;
    //       left: 6px;
    //       bottom: 6px;
    //     }
    //   }
    // }

    .box-anthology-item {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--td-size-4);

      .box-anthology-header {
        height: fit-content;
        width: 100%;
      }

      .box-anthology-content {
        width: 100%;
        height: 100%;
        flex: 1 1 0;

        .grid-wrap {
          gap: var(--td-size-4);
          // display: grid;
          // grid-template-columns: repeat(11, var(--td-comp-size-xxl));
          // grid-template-rows: repeat(1, auto);
          width: 100%;
          display: flex;
          flex-wrap: wrap;

          .item-wrap {
            position: relative;
            width: var(--td-comp-size-xxl);
            height: var(--td-comp-size-xl);
            line-height: var(--td-comp-size-xl);
            font-size: var(--td-font-size-title-large);
            border-radius: var(--td-radius-medium);
            text-align: center;
            cursor: pointer;
            background-color: var(--td-border-level-1-color);

            &:not(.is-active):hover {
              .list-item {
                background-color: var(--td-bg-color-component-active);

                .title {
                  color: var(--td-text-color-primary);
                }
              }
            }

            .list-item {
              border-radius: var(--td-radius-medium);

              .title {
                color: var(--td-text-color-secondary);
              }
            }
          }

          .is-active {
            .list-item {
              background-color: var(--td-brand-color-2);

              .title {
                color: var(--td-brand-color);
              }
            }
          }
        }
      }
    }
  }
}
</style>
