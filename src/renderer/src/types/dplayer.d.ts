/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type DPlayerEvents =
  | 'abort'
  | 'canplay'
  | 'canplaythrough'
  | 'durationchange'
  | 'emptied'
  | 'ended'
  | 'error'
  | 'loadeddata'
  | 'loadedmetadata'
  | 'loadstart'
  | 'mozaudioavailable'
  | 'pause'
  | 'play'
  | 'playing'
  | 'progress'
  | 'ratechange'
  | 'seeked'
  | 'seeking'
  | 'stalled'
  | 'suspend'
  | 'timeupdate'
  | 'volumechange'
  | 'waiting'
  // 播放器事件
  | 'close'
  | 'timeout'
  | 'ready'
  | 'screenshot'
  | 'contextmenu_show'
  | 'contextmenu_hide'
  | 'fetch_start'
  | 'fetch_stop'
  | 'notice_show'
  | 'notice_hide'
  | 'quality_start'
  | 'quality_end'
  | 'destroy'
  | 'resize'
  | 'fullscreen'
  | 'fullscreen_cancel'
  | 'position'
  | 'forward'

export type Preload = 'none' | 'metadata' | 'auto'
export type VideoType =
  | 'auto'
  | 'hls'
  | 'flv'
  | 'dash'
  | 'webtorrent'
  | 'normal'

export type DPlayerDisplay = 'none' | 'alway' | 'auto'

export interface DPlayerHighLightItem {
  text: string
  time: number
}

export interface DPlayerContextMenuItem {
  text: string
  link?: string | undefined
  click?: ((player: any) => void) | undefined
}

export interface DPlayerVideoQuality {
  name: string
  url: string
  type?: string | undefined
}

export interface DPlayerVideo {
  url: string
  pic?: string | undefined
  type?: VideoType | string | undefined
  customType?: any
  quality?: DPlayerVideoQuality[] | undefined
  defaultQuality?: number | undefined
}

export interface RateParam {
  enabled: boolean
  min: number
  max: number
}

export interface RecordParam {
  enabled: boolean
  live?: boolean | undefined
}

export interface DPlayerOptions {
  autoplay?: boolean
  autoRate?: RateParam
  closeTime?: number
  connect?: boolean
  container?: HTMLElement | null
  controls?: boolean
  contextmenu?: DPlayerContextMenuItem[]
  debug?: boolean
  hasAudio?: boolean
  hotkey?: boolean
  lang?: string
  live?: boolean
  logo?: string
  loop?: boolean
  muted?: boolean
  mutex?: boolean
  order?: number
  preload?: Preload
  preventClickToggle?: boolean
  src: string
  record?: boolean
  replay?: number
  theme?: string
  title?: string
  video?: DPlayerVideo
  volume?: number
  unique?: string
  userData?: any
  duration?: number
  startTime?: number
  loading?: boolean
}

type __VLS_WithTemplateSlots<T, S> = T & {
  new (): {
    $slots: S
  }
}

declare const _default: __VLS_WithTemplateSlots<
  import('vue').DefineComponent<
    {
      allowPause: {
        type: BooleanConstructor
        default: boolean
      }
      border: {
        type: BooleanConstructor
        default: boolean
      }
      fill: {
        type: BooleanConstructor
        default: boolean
      }
      alarm: {
        type: StringConstructor
        default: string
      }
      index: {
        type: NumberConstructor
        default: number
      }
      /**
       * 锁定控制栏
       */
      controls: {
        type: StringConstructor
        default: string
      }
      lang: {
        type: StringConstructor
        default: string
      }
      forward: {
        type: BooleanConstructor
        default: boolean
      }
      screenshot: {
        type: BooleanConstructor
        default: boolean
      }
      fullscreen: {
        type: BooleanConstructor
        default: boolean
      }
      options: {
        type: ObjectConstructor
        default(): {
          autoplay: boolean
          controls: boolean
          contextmenu: never[]
          hotkey: boolean
          live: boolean
          logo: undefined
          loop: boolean
          muted: boolean
          mutex: boolean
          preload: string
          src: undefined
          theme: string
          volume: number
        }
      }
      poster: {
        type: StringConstructor
        default: string
      }
      timeout: {
        type: NumberConstructor
        default: number
      }
    },
    {
      bufferedEnd: () => number
      close: () => void
      currentTime: () => number
      currentUrl: () => string
      el: () => any
      error: (msg: string) => void
      focused: (focus?: boolean) => boolean | undefined
      getOptions: () =>
        | {
            autoplay?: boolean | undefined
            autoRate?:
              | {
                  enabled: boolean
                  min: number
                  max: number
                }
              | undefined
            closeTime?: number | undefined
            connect?: boolean | undefined
            container?: HTMLElement | null | undefined
            controls?: boolean | undefined
            contextmenu?:
              | {
                  text: string
                  link?: string | undefined
                  click?: ((player: any) => void) | undefined
                }[]
              | undefined
            debug?: boolean | undefined
            hasAudio?: boolean | undefined
            hotkey?: boolean | undefined
            lang?: string | undefined
            live?: boolean | undefined
            logo?: string | undefined
            loop?: boolean | undefined
            muted?: boolean | undefined
            mutex?: boolean | undefined
            order?: number | undefined
            preload?: import('../../d.ts').Preload | undefined
            preventClickToggle?: boolean | undefined
            src: string
            record?: boolean | undefined
            replay?: number | undefined
            theme?: string | undefined
            title?: string | undefined
            video?:
              | {
                  url: string
                  pic?: string | undefined
                  type?: string | undefined
                  customType?: any
                  quality?:
                    | {
                        name: string
                        url: string
                        type?: string | undefined
                      }[]
                    | undefined
                  defaultQuality?: number | undefined
                }
              | undefined
            volume?: number | undefined
            unique?: string | undefined
            userData?: any
            duration?: number | undefined
            startTime?: number | undefined
          }
        | undefined
      index: () => number
      locale: (key: string) => any
      message: () => string
      muted: () => void
      occupy: (
        order: number,
        unique: string,
        text: string,
        userData: any
      ) => void
      order: () => number
      pause: () => void
      play: (option: DPlayerOptions | undefined) => void
      playRate: (rate: number, notify?: boolean) => number
      position: () => number
      seek: (time: number) => void
      snapshot: () => void
      status: () => number
      toggle: () => void
      toggleScreen: () => void
      trigger: (event: string) => void
      volume: (percentage?: number, nonotice?: boolean) => number
      unique: () => string | undefined
      userData: () => any
    },
    unknown,
    {},
    {},
    import('vue').ComponentOptionsMixin,
    import('vue').ComponentOptionsMixin,
    (
      | 'progress'
      | 'position'
      | 'ready'
      | 'timeupdate'
      | 'fetch_start'
      | 'abort'
      | 'fetch_stop'
      | 'canplay'
      | 'canplaythrough'
      | 'durationchange'
      | 'emptied'
      | 'ended'
      | 'error'
      | 'loadeddata'
      | 'loadedmetadata'
      | 'loadstart'
      | 'mozaudioavailable'
      | 'pause'
      | 'play'
      | 'playing'
      | 'ratechange'
      | 'seeked'
      | 'seeking'
      | 'stalled'
      | 'suspend'
      | 'volumechange'
      | 'waiting'
      | 'timeout'
      | 'screenshot'
      | 'contextmenu_show'
      | 'contextmenu_hide'
      | 'notice_show'
      | 'notice_hide'
      | 'quality_start'
      | 'quality_end'
      | 'destroy'
      | 'resize'
      | 'fullscreen'
      | 'fullscreen_cancel'
      | 'forward'
    )[],
    | 'progress'
    | 'position'
    | 'ready'
    | 'timeupdate'
    | 'fetch_start'
    | 'abort'
    | 'fetch_stop'
    | 'canplay'
    | 'canplaythrough'
    | 'durationchange'
    | 'emptied'
    | 'ended'
    | 'error'
    | 'loadeddata'
    | 'loadedmetadata'
    | 'loadstart'
    | 'mozaudioavailable'
    | 'pause'
    | 'play'
    | 'playing'
    | 'ratechange'
    | 'seeked'
    | 'seeking'
    | 'stalled'
    | 'suspend'
    | 'volumechange'
    | 'waiting'
    | 'timeout'
    | 'screenshot'
    | 'contextmenu_show'
    | 'contextmenu_hide'
    | 'notice_show'
    | 'notice_hide'
    | 'quality_start'
    | 'quality_end'
    | 'destroy'
    | 'resize'
    | 'fullscreen'
    | 'fullscreen_cancel'
    | 'forward',
    import('vue').VNodeProps &
      import('vue').AllowedComponentProps &
      import('vue').ComponentCustomProps,
    Readonly<
      import('vue').ExtractPropTypes<{
        allowPause: {
          type: BooleanConstructor
          default: boolean
        }
        border: {
          type: BooleanConstructor
          default: boolean
        }
        fill: {
          type: BooleanConstructor
          default: boolean
        }
        alarm: {
          type: StringConstructor
          default: string
        }
        index: {
          type: NumberConstructor
          default: number
        }
        /**
         * 锁定控制栏
         */
        controls: {
          type: StringConstructor
          default: string
        }
        lang: {
          type: StringConstructor
          default: string
        }
        forward: {
          type: BooleanConstructor
          default: boolean
        }
        screenshot: {
          type: BooleanConstructor
          default: boolean
        }
        fullscreen: {
          type: BooleanConstructor
          default: boolean
        }
        options: {
          type: ObjectConstructor
          default(): {
            autoplay: boolean
            controls: boolean
            contextmenu: never[]
            hotkey: boolean
            live: boolean
            logo: undefined
            loop: boolean
            muted: boolean
            mutex: boolean
            preload: string
            src: undefined
            theme: string
            volume: number
          }
        }
        poster: {
          type: StringConstructor
          default: string
        }
        timeout: {
          type: NumberConstructor
          default: number
        }
      }>
    > & {
      onError?: ((...args: any[]) => any) | undefined
      onAbort?: ((...args: any[]) => any) | undefined
      onCanplay?: ((...args: any[]) => any) | undefined
      onCanplaythrough?: ((...args: any[]) => any) | undefined
      onDurationchange?: ((...args: any[]) => any) | undefined
      onEmptied?: ((...args: any[]) => any) | undefined
      onEnded?: ((...args: any[]) => any) | undefined
      onLoadeddata?: ((...args: any[]) => any) | undefined
      onLoadedmetadata?: ((...args: any[]) => any) | undefined
      onLoadstart?: ((...args: any[]) => any) | undefined
      onPause?: ((...args: any[]) => any) | undefined
      onPlay?: ((...args: any[]) => any) | undefined
      onPlaying?: ((...args: any[]) => any) | undefined
      onProgress?: ((...args: any[]) => any) | undefined
      onRatechange?: ((...args: any[]) => any) | undefined
      onSeeked?: ((...args: any[]) => any) | undefined
      onSeeking?: ((...args: any[]) => any) | undefined
      onStalled?: ((...args: any[]) => any) | undefined
      onSuspend?: ((...args: any[]) => any) | undefined
      onTimeupdate?: ((...args: any[]) => any) | undefined
      onVolumechange?: ((...args: any[]) => any) | undefined
      onWaiting?: ((...args: any[]) => any) | undefined
      onPosition?: ((...args: any[]) => any) | undefined
      onReady?: ((...args: any[]) => any) | undefined
      onFetch_start?: ((...args: any[]) => any) | undefined
      onFetch_stop?: ((...args: any[]) => any) | undefined
      onMozaudioavailable?: ((...args: any[]) => any) | undefined
      onTimeout?: ((...args: any[]) => any) | undefined
      onScreenshot?: ((...args: any[]) => any) | undefined
      onContextmenu_show?: ((...args: any[]) => any) | undefined
      onContextmenu_hide?: ((...args: any[]) => any) | undefined
      onNotice_show?: ((...args: any[]) => any) | undefined
      onNotice_hide?: ((...args: any[]) => any) | undefined
      onQuality_start?: ((...args: any[]) => any) | undefined
      onQuality_end?: ((...args: any[]) => any) | undefined
      onDestroy?: ((...args: any[]) => any) | undefined
      onResize?: ((...args: any[]) => any) | undefined
      onFullscreen?: ((...args: any[]) => any) | undefined
      onFullscreen_cancel?: ((...args: any[]) => any) | undefined
      onForward?: ((...args: any[]) => any) | undefined
    },
    {
      fill: boolean
      timeout: number
      screenshot: boolean
      fullscreen: boolean
      forward: boolean
      allowPause: boolean
      border: boolean
      alarm: string
      index: number
      controls: string
      lang: string
      options: Record<string, any>
      poster: string
    },
    {}
  >,
  {
    ready: (_: {}) => any
    loading: (_: {}) => any
    error: (_: {}) => any
  }
>
export default _default
