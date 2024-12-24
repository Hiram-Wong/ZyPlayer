import { defineComponent, onUnmounted, ref, shallowRef, toRaw } from 'vue';
import type { SetupContext } from 'vue';
import { ArtPlayerAdapter, DPlayerAdapter, NPlayerAdapter, XgPlayerAdapter } from './core';
import { singleton, mediaUtils } from './utils/tool';
import './assets/css/index.less';

const MultiPlayer = defineComponent({
  name: 'MultiPlayer',
  emits: ['updateTime'],
  setup(_props, ctx: SetupContext) {
    const adapter = shallowRef<any>();
    const mseRef = ref<HTMLDivElement | null>();
    const adapterRelation = {
      artplayer: ArtPlayerAdapter,
      dplayer: DPlayerAdapter,
      nplayer: NPlayerAdapter,
      xgplayer: XgPlayerAdapter,
    };

    const formatUrlHeaders = (url: string, headers: { [key: string]: string }) => {
      if (headers) {
        for (const key in headers) {
          let valye = headers[key];
          if (valye.includes('=')) valye = valye.replaceAll('=', '$*&');
          url += `@${key}=${valye}`;
        }
      }
      return url;
    };

    const formatRemoveUnSafeHeaders = (headers: { [key: string]: string }) => {
      const unsafeHeads = ['host', 'referer', 'origin', 'user-agent', 'content-length', 'set-cookie'];

      for (const header in headers) {
        if (unsafeHeads.includes(header.toLowerCase())) delete headers[header];
      }

      return headers;
    };

    const create = async (doc: { [key: string]: any }, type: string = 'artplayer') => {
      if (!doc?.url) return;
      if (!Object.keys(adapterRelation).includes(type)) return;
      if (adapter.value) await destroy();
      const singleAdapter = singleton(adapterRelation?.[type]);
      adapter.value = new singleAdapter();

      if (mseRef.value) mseRef.value.id = doc.container;
      if (!doc.type) {
        const checkType = await mediaUtils.checkMediaType(doc.url);
        if (checkType === 'unknown' && !checkType) return;
        doc.type = checkType;
      }
      doc.url = formatUrlHeaders(doc.url, doc.headers);
      doc.type = mediaUtils.mediaType2PlayerType(doc.type);
      doc.headers = formatRemoveUnSafeHeaders(doc.headers);
      await adapter.value.create(toRaw(doc));
    };

    const destroy = async () => {
      if (!adapter.value) return;
      await adapter.value.destroy();
      adapter.value = null;
    };

    const play = async () => {
      if (!adapter.value) return;
      await adapter.value.play();
    };

    const pause = async () => {
      if (!adapter.value) return;
      await adapter.value.pause();
    };

    const barrage = async (comments: string[], url: string, id: string) => {
      if (!adapter.value) return;
      await adapter.value.barrage(toRaw(comments), url, id);
    };

    const onTimeUpdate = async () => {
      if (!adapter.value) return;
      await adapter.value.onTimeUpdate(({ currentTime, duration }) => {
        ctx.emit('updateTime', { currentTime, duration });
      });
    };

    onUnmounted(() => {
      destroy();
    });

    ctx.expose({
      barrage,
      create,
      destroy,
      play,
      pause,
      onTimeUpdate
    });

    return () => (
      <div class="multi-player">
        <div ref={mseRef} id="multi-mse" class="multi-mse"></div>
      </div>
    );
  },
});

export default MultiPlayer;
export type MultiPlayerInstance = InstanceType<typeof MultiPlayer>;
