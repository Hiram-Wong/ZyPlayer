<template>
  <div class="container-aside-drive">
    <div class="tvg-block">
      <div class="title-album">
        <p class="title-text txthide">{{ formData.title }}</p>
      </div>
    </div>
    <div class="anthology-contents">
      <div class="box-anthology-header">
        <div class="left">
          <h4 class="box-anthology-title">{{ $t('pages.player.film.anthology') }}</h4>
        </div>
        <div class="right"></div>
      </div>
      <div class="listbox drive-listbox">
        <t-list class="contents-wrap" split :scroll="{ type: 'virtual' }">
          <t-list-item v-for="item in seasonList" :key="item.id" class="content" @click="changeDriveEvent(item)">
            <div class="logo-wrap">
              <t-image
                class="logo"
                fit="cover"
                :src="item['thumb']"
                :style="{ width: '64px', height: '28px', background: 'none', borderRadius: '6px' }"
                :lazy="true"
                :loading="renderLoading"
                :error="renderError"
              />
            </div>
            <div class="title-wrap txthide">{{ item['name'] }}</div>
            <div class="status-wrap">
              <span :class="info['name'] === item['name'] ? 'playing' : 'unplay'">
                {{
                  item['name'] === info['name']
                    ? $t('pages.player.status.playing')
                    : $t('pages.player.status.unplay')
                }}
              </span>
            </div>
          </t-list-item>
        </t-list>
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { ref, watch, onMounted } from 'vue';
import { Tv1Icon, LoadingIcon } from 'tdesign-icons-vue-next';
import { fetchAlistFile, putAlistInit } from '@/api/drive';

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
const formData = ref({
  title: props.info.name
});
const seasonList = ref<any[]>([]);
const active = ref({
  nav: 'season',
});

watch(
  () => props.info,
  (val) => {
    infoConf.value = val;
    formData.value.title = val.name;
  },
  { deep: true }
);
watch(
  () => props.ext,
  (val) => {
    extConf.value = val;
    seasonList.value = val.files;
  },
  { deep: true }
);
onMounted(() => {
  seasonList.value = extConf.value.files;
  emits('play', infoConf.value);
});

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

const changeDriveEvent = async (item) => {
  await putAlistInit({ sourceId: extConf.value.site.id });
  const res = await fetchAlistFile({ sourceId: extConf.value.site.id, path: item.path });
  emits('update', {
    type: 'drive',
    data: Object.assign({ info: res, ext: extConf })
  });
  emits('play', { url: res.url, headers: res?.header || {} });
};
</script>

<style lang="less" scoped>
.container-aside-drive {
  .title-text {
    max-width: 100% !important;
  }
}
</style>
