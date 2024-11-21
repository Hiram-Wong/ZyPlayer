<template>
  <div class="container-aside-iptv">
    <div class="tvg-block">
      <div class="title-album">
        <p class="title-text txthide">{{ formData.title }}</p>
      </div>
    </div>
    <div class="anthology-contents">
      <t-tabs v-model="active.nav" class="listbox iptv-listbox">
        <t-tab-panel value="epg" :label="$t('pages.player.iptv.epg')">
          <t-list class="contents-wrap" split :scroll="{ type: 'virtual' }" v-if="active.nav === 'epg'">
            <t-list-item v-for="(item, index) in epgList" :key="index" class="content">
              <div class="time-warp">{{ item['start'] }}</div>
              <div class="title-wrap txthide">{{ item['title'] }}</div>
              <div class="status-wrap">
                <span v-if="formatEpgStatus(item['start'], item['end']) === 'played'" class="played">
                  {{ $t(`pages.player.status.${formatEpgStatus(item['start'], item['end'])}`) }}
                </span>
                <span v-if="formatEpgStatus(item['start'], item['end']) === 'playing'" class="playing">
                  {{ $t(`pages.player.status.${formatEpgStatus(item['start'], item['end'])}`) }}
                </span>
                <span v-if="formatEpgStatus(item['start'], item['end']) === 'unplay'" class="unplay">
                  {{ $t(`pages.player.status.${formatEpgStatus(item['start'], item['end'])}`) }}
                </span>
              </div>
            </t-list-item>
          </t-list>
        </t-tab-panel>
        <t-tab-panel value="channel" :label="$t('pages.player.iptv.channel')">
          <title-menu :list="classList" :active="active.class" class="nav" @change-key="changeNavEvent" />
          <div class="contents-wrap scroll-y channel-wrap">
            <div v-for="item in channelList" :key="item['id']" class="content">
              <div class="content-item content-item-start" @click="changeChannelEvent(item)">
                <div class="logo-wrap">
                  <t-image
                    class="logo"
                    fit="contain"
                    :src="item.logo"
                    :style="{ width: '64px', height: '32px', maxHeight: '32px', background: 'none' }"
                    :lazy="true"
                    :loading="renderLoading"
                    :error="renderError"
                  >
                  </t-image>
                </div>
                <div class="title-wrap txthide title-warp-channel">{{ item['name'] }}</div>
                <div class="status-wrap">
                  <span :class="item['id'] === info['id'] ? 'playing' : 'unplay'">
                    {{
                      item['id'] === info['id']
                        ? $t('pages.player.status.playing')
                        : $t('pages.player.status.unplay')
                    }}
                  </span>
                </div>
              </div>
              <t-divider dashed style="margin: 5px 0" />
            </div>
            <infinite-loading
              class="infinite-loading-container"
              target=".channel-wrap"
              :identifier="infiniteId"
              :distance="200"
              @infinite="load"
            >
              <template #complete>{{ $t('pages.player.infiniteLoading.complete') }}</template>
              <template #error>{{ $t('pages.player.infiniteLoading.error') }}</template>
            </infinite-loading>
          </div>
        </t-tab-panel>
      </t-tabs>
    </div>
  </div>
</template>

<script setup lang="tsx">
import 'v3-infinite-loading/lib/style.css';
import { ref, watch, onMounted } from 'vue';
import moment from 'moment';
import InfiniteLoading from 'v3-infinite-loading';
import { Tv1Icon, LoadingIcon } from 'tdesign-icons-vue-next';
import { fetchChannelPage, fetchChannelEpg } from '@/api/iptv';
import TitleMenu from '@/components/title-menu/index.vue';

const props = defineProps({
  info: {
    type: Object,
    default: {}
  },
  ext: {
    type: Object,
    default: {}
  }
});

const emits = defineEmits(['update', 'play']);
const infoConf = ref(props.info);
const extConf = ref(props.ext);
const infiniteId = ref(+new Date());
const formData = ref({
  title: props.info.name
});
const channelList = ref<any[]>([]);
const classList = ref<any[]>([]);
const epgList = ref([]);
const active = ref({
  nav: 'epg',
  class: '全部',
});
const pagination = ref({
  pageIndex: 1,
  pageSize: 32,
  count: 0,
});

watch(
  () => props.info,
  (val) => {
    infoConf.value = val;
    formData.value.title = val.name;
    getEpgList(val.name, moment().format('YYYY-MM-DD'));
  },
  { deep: true }
);
watch(
  () => props.ext,
  (val) => {
    extConf.value = val;
  },
  { deep: true }
);
onMounted(()=>{
  getEpgList(formData.value.title, moment().format('YYYY-MM-DD'));
  emits('play', { url: infoConf.value.url, isLive: true });
})

/**
 * 格式化 EPG 状态
 * @param start 开始时间
 * @param end 结束时间
 * @returns 'playing' | 'unplay' | 'played'
 */
const formatEpgStatus = (start: string, end: string): 'playing' | 'unplay' | 'played' => {
  const nowTimestamp = moment();
  const startTimestamp = moment().set({
    hours: parseInt(start.split(':')[0], 10),
    minutes: parseInt(start.split(':')[1], 10),
  });
  const endTimestamp = moment().set({
    hours: parseInt(end.split(':')[0], 10),
    minutes: parseInt(end.split(':')[1], 10),
  });

  if (nowTimestamp.isBetween(startTimestamp, endTimestamp)) return 'playing';
  if (nowTimestamp.isBefore(startTimestamp)) return 'unplay';
  if (nowTimestamp.isAfter(endTimestamp)) return 'played';

  throw new Error('Invalid state: unable to determine EPG status');
};

const renderError = () => {
  return (
    <div class="renderIcon">
      <Tv1Icon size="1.5em" stroke-width="2" />
    </div>
  );
};
const renderLoading = () => {
  return (
    <div class="renderIcon">
      <LoadingIcon size="1.5em" stroke-width="2" />
    </div>
  );
};

// 获取直播列表
const getChannelList = async () => {
  const { pageIndex, pageSize } = pagination.value;

  const res = await fetchChannelPage({ page: pageIndex, pageSize, kw: '', group: active.value.class });
  if (Array.isArray(res["class"]) && res["class"].length > 0) {
    classList.value = res["class"];
    classList.value.unshift({ type_id: '全部', type_name: '全部' });
  };
  if (res.hasOwnProperty('total')) pagination.value.count = res["total"];
  channelList.value = [...channelList.value, ...res.data];

  pagination.value.pageIndex++;
  return res.data.length;
};

// 加载channel
const load = async ($state: { complete: () => void; loaded: () => void; error: () => void }) => {
  console.log('[iptv][channel]loading...');
  try {
    const resLength = await getChannelList();
    console.log(`[iptv][channel]return length: ${resLength}`);
    if (resLength === 0) $state.complete();
    else $state.loaded();
  } catch (err) {
    console.error(err);
    $state.error();
  }
};

/**
 * 获取epg列表
 * @param name 频道名称
 * @param date 日期
 */
const getEpgList = async (name: string, date: string) => {
  try {
    const res = await fetchChannelEpg({ name, date });
    epgList.value = res;
  } catch (err: any) {
    console.log(`[iptv][epg][error]${err.message}`);
  }
};

// 切换channel
const changeChannelEvent = async (item) => {
  emits('update', {
    type: 'iptv',
    data: Object.assign({ info: item, ext: extConf })
  })
  emits('play', { url: item.url, isLive: true });
};

const changeNavEvent = (key: string) => {
  active.value.class = key;
  channelList.value = [];
  pagination.value.pageIndex = 1;
  infiniteId.value++;
};
</script>

<style lang="less" scoped>
.container-aside-iptv {
  .title-text {
    max-width: 100% !important;
  }
}
</style>
