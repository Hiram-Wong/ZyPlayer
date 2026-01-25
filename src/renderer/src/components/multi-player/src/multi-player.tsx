import './assets/css/index.less';

import type { SetupContext, SlotsType } from 'vue';
import { defineComponent, onUnmounted, ref, shallowRef, toRaw } from 'vue';

import { ArtPlayerAdapter, DPlayerAdapter, NPlayerAdapter, OPlayerAdapter, XgPlayerAdapter } from './core';
import type {
  IBarrage,
  IDecoderType,
  IMultiPlayerAdapter,
  IMultiPlayerCreateMode,
  IMultiPlayerOptions,
  IMultiPlayerSlots,
  IMultiPlayerType,
  ISinglePlayerAdapter,
} from './types';
import { mediaUtils, singleton } from './utils/tool';

const adapterRelation: Record<IMultiPlayerType, new () => any> = {
  artplayer: ArtPlayerAdapter,
  dplayer: DPlayerAdapter,
  nplayer: NPlayerAdapter,
  xgplayer: XgPlayerAdapter,
  oplayer: OPlayerAdapter,
};

const MultiPlayer = defineComponent({
  name: 'MultiPlayer',
  slots: (() => {}) as SlotsType<IMultiPlayerSlots>,
  emits: ['updateTime'],

  setup(_props: any, ctx: SetupContext) {
    const adapter = shallowRef<ISinglePlayerAdapter | null>(null);
    const currentAdapterType = ref<IMultiPlayerType | null>(null);
    const mseRef = ref<HTMLDivElement | null>(null);
    const selfRef = ref<HTMLDivElement | null>(null);

    const barrage = (comments: IBarrage[], id: string) => adapter.value?.barrage?.(toRaw(comments), id);

    const create = async (
      rawOptions: Partial<IMultiPlayerOptions>,
      player?: IMultiPlayerType,
      mode?: IMultiPlayerCreateMode,
    ) => {
      if (!rawOptions?.url || !rawOptions.container) return;

      const playerType = player ?? (Object.keys(adapterRelation)[0] as IMultiPlayerType);
      const playerMode = mode ?? 'switch';

      const options: Required<IMultiPlayerOptions> = {
        container: rawOptions.container,
        type: rawOptions.type!,
        url: rawOptions.url,
        startTime: typeof rawOptions.startTime === 'number' ? rawOptions.startTime : 0,
        autoplay: typeof rawOptions.autoplay === 'boolean' ? rawOptions.autoplay : true,
        isLive: !!rawOptions.isLive,
        next: !!rawOptions.next,
        quality: Array.isArray(rawOptions.quality) ? rawOptions.quality : [],
        headers:
          rawOptions.headers && typeof rawOptions.headers === 'object' && Object.keys(rawOptions.headers).length
            ? rawOptions.headers
            : {},
      };

      if (!options.type || options.type === 'auto') {
        const detected = await mediaUtils.checkMediaType(options.url, options.headers);
        if (!detected) return;
        options.type = detected as IDecoderType;
      }
      options.type = mediaUtils.getDecoderFromExtension(options.type);

      if (Object.keys(options.headers).length) {
        options.headers = mediaUtils.convertWebToElectron(options.headers);

        if (
          (options.type === 'mp4' && playerType !== 'xgplayer') ||
          (['mpd', 'dash', 'shaka', 'flv'].includes(options.type) && playerType === 'oplayer') ||
          (['mpd', 'dash', 'shaka'].includes(options.type) && playerType === 'xgplayer')
        ) {
          options.url = mediaUtils.convertStandardToUri(options.url, options.headers);
        }
      }

      console.debug('[MultiPlayer] create with options:', options);

      if (playerMode === 'switch') {
        try {
          if (adapter.value && currentAdapterType.value === playerType) {
            await adapter.value.switchUrl(toRaw(options));
            return;
          }
        } catch {}
      }

      currentAdapterType.value = playerType;

      await destroy();

      mseRef.value && (mseRef.value.id = rawOptions.container);

      const AdapterCtor = adapterRelation[playerType];
      const SingleAdapter = singleton(AdapterCtor);

      adapter.value = new SingleAdapter();
      await adapter.value!.create(toRaw(options));
      onTimeUpdate();
    };

    const destroy = async () => {
      if (!adapter.value) return;

      try {
        await adapter.value.destroy();
      } catch {}
      adapter.value = null;

      if (mseRef.value) {
        mseRef.value.className = 'multi-player__mse';
        mseRef.value.id = 'mse';

        const attrs = Array.from(mseRef.value.attributes);
        for (const attr of attrs) {
          if (attr.name !== 'class' && attr.name !== 'id') {
            try {
              mseRef.value.removeAttribute(attr.name);
            } catch {}
          }
        }
      }
    };

    const play = async () => adapter.value?.play();
    const pause = async () => adapter.value?.pause();
    const togglePlay = () => adapter.value?.togglePlay();

    const time = () => adapter.value?.time;
    const seek = (time: number) => adapter.value?.seek(time);

    const playbackRate = () => adapter.value?.playbackRate;
    const setPlaybackRate = (rate: number) => {
      if (adapter.value) adapter.value.playbackRate = rate;
    };

    const muted = () => adapter.value?.muted;
    const setMuted = (muted: boolean) => {
      if (adapter.value) adapter.value.muted = muted;
    };
    const toggleMuted = () => adapter.value?.toggleMuted();

    const volume = () => adapter.value?.volume;
    const setVolume = (volume: number) => {
      if (adapter.value) adapter.value.volume = volume;
    };

    const onTimeUpdate = () => {
      if (!adapter.value) return;

      adapter.value.offTimeUpdate();
      adapter.value.onTimeUpdate(({ currentTime, duration }) => {
        ctx.emit('updateTime', { currentTime, duration });
      });
    };

    const instance = () => adapter.value?.instance;

    onUnmounted(() => destroy());

    ctx.expose({
      barrage,
      create,
      destroy,
      play,
      pause,
      togglePlay,
      toggleMuted,
      time,
      seek,
      playbackRate,
      setPlaybackRate,
      muted,
      setMuted,
      volume,
      setVolume,
      instance,
    });

    return () => (
      <div class="multi-player" ref={selfRef}>
        <div ref={mseRef} id="mse" class="multi-player__mse" />
        {ctx.slots.header && adapter.value ? <div class="multi-player__header">{ctx.slots.header()}</div> : null}
      </div>
    );
  },
}) as unknown as new () => { $el: HTMLElement; $props: any } & IMultiPlayerAdapter;

export default MultiPlayer;
export type MultiPlayerInstance = InstanceType<typeof MultiPlayer>;
