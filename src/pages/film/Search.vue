<template>
  <div class="hd-search">
    <div v-show="isFocus && hotList.length !== 0" class="modal" @click.self="isFocus = false"></div>
    <div class="sh-search" :class="{ act: isFocus && hotList.length !== 0 }">
      <div ref="searchRef" class="hd-search skin1" :class="[isFocus && hotList.length !== 0 ? 'open focus' : 'hide']">
        <div class="hd-search-inner">
          <input
            v-model.trim="searchTxt"
            placeholder="输入关键词"
            class="hd-input"
            @keyup.enter="searchInputEvent"
            @focus="focusEvent"
          />
          <a class="search-hotlink" @click="isDialogHot = true">
            <chart-bar-icon size="14" class="search-hotlink-icon" />
            热榜
          </a>
          <div class="hd-submit" @mousedown="searchInputEvent">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <g transform="translate(1.5 1.461)" stroke="currentColor" fill="none" fill-rule="evenodd">
                <path d="M7.5 15a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z" stroke-width="2"></path>
                <rect transform="rotate(-45 13.975 14.014)" x="13.475" y="12.014" width="1" height="4" rx=".5"></rect>
              </g>
            </svg>
          </div>
        </div>
        <div v-if="isFocus && hotList.length !== 0" class="hd-result">
          <div class="top-line"></div>
          <div class="search-hot">
            <div class="search-head">
              <div class="search-title">今日热搜</div>
            </div>
            <div class="search-body">
              <a
                v-for="(item, index) in hotList"
                :key="index"
                :class="[index < 4 ? 'item-hot' : 'item-news']"
                @click="searchHotEvent(item.vod_name)"
              >
                <span class="num">{{ index + 1 }}</span>
                <span class="num-svg">
                  <svg v-if="index === 0" viewBox="0 0 60 107">
                    <path
                      fill="#F53851"
                      fill-rule="nonzero"
                      d="M2 43.874V30.323L20.652 18H33.41v89H20.652V31.49z"
                    ></path>
                  </svg>
                  <svg v-if="index === 1" viewBox="0 0 60 107">
                    <path
                      d="m1.075 95.072 34.451-43.11c1.373-1.775 2.28-3.39 2.725-4.843.323-1.493.484-2.825.484-3.996 0-2.22-.484-4.269-1.453-6.145-.969-1.877-2.371-3.391-4.208-4.541-1.837-1.15-4.006-1.746-6.509-1.787-3.511 0-6.428 1.12-8.749 3.36-2.32 2.241-3.703 5.36-4.147 9.355H1.075c.323-7.346 2.785-13.421 7.387-18.224 4.722-4.723 10.434-7.105 17.135-7.145 7.588.08 13.744 2.503 18.466 7.266 2.422 2.381 4.239 5.106 5.45 8.174a25.668 25.668 0 0 1 1.816 9.505c0 2.907-.454 5.732-1.362 8.477-.909 2.745-2.21 5.187-3.906 7.326L17.665 94.346h33.724V107H1.075V95.072Z"
                      fill="#F55438"
                      fill-rule="nonzero"
                    ></path>
                  </svg>
                  <svg v-if="index === 2" viewBox="0 0 60 107">
                    <path
                      d="M21.042 54.898H25.4c2.825 0 5.267-.534 7.326-1.604 2.059-1.07 3.623-2.543 4.692-4.42 1.07-1.877 1.605-4.047 1.605-6.509-.04-2.462-.616-4.642-1.726-6.539a12.033 12.033 0 0 0-4.57-4.48c-1.938-1.09-4.138-1.655-6.6-1.696-2.866 0-5.41.909-7.63 2.725-2.22 1.816-3.713 4.46-4.48 7.932H1.364c.403-4.32 1.735-8.245 3.996-11.777 2.26-3.532 5.167-6.327 8.719-8.385 3.552-2.06 7.407-3.109 11.564-3.149 5.167.04 9.718 1.211 13.653 3.512 3.936 2.3 6.963 5.348 9.082 9.142 2.12 3.795 3.22 7.952 3.3 12.473 0 3.39-.605 6.66-1.816 9.809-1.373 3.108-3.895 5.913-7.569 8.416 3.553 2.34 6.176 5.176 7.872 8.506 1.695 3.33 2.543 6.953 2.543 10.869-.04 8.234-2.604 14.753-7.69 19.556-2.502 2.463-5.368 4.31-8.598 5.54a27.656 27.656 0 0 1-9.93 1.847c-3.067 0-6.044-.494-8.93-1.483-2.886-.99-5.439-2.412-7.66-4.269C5.3 97.08 2.293 91.47.88 84.082h12.654c2.543 6.66 6.922 9.99 13.138 9.99 3.714 0 6.842-1.271 9.385-3.814 2.624-2.382 3.956-5.772 3.996-10.172-.04-2.906-.656-5.419-1.846-7.538-1.191-2.12-2.806-3.724-4.844-4.814-2.039-1.09-4.37-1.634-6.993-1.634h-5.328V54.898Z"
                      fill="#F59138"
                      fill-rule="nonzero"
                    ></path>
                  </svg>
                  <svg v-if="index === 3" viewBox="0 0 60 107">
                    <path
                      d="m.479 81.771 29.486-63.21h14.108l-29.85 63.21h23.068v-25.37h12.655v25.37h7.023v11.928h-7.023v13.138H37.29V93.7H.48z"
                      fill="currentColor"
                      fill-rule="nonzero"
                    ></path>
                  </svg>
                </span>
                <div class="info">
                  <div v-if="index < 4" class="pic">
                    <img :src="item.vod_pic" alt="" />
                  </div>
                  <div class="txt">
                    <span class="name">{{ item.vod_name }}</span>
                    <span v-if="index < 4" class="remarks">
                      {{ item.vod_remarks ? item.vod_remarks : '暂无数据' }}
                    </span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <hot-view v-model:visible="isDialogHot" />
  </div>
</template>

<script setup lang="ts">
import { ChartBarIcon } from 'tdesign-icons-vue-next';
import { onMounted, onUnmounted, ref, watch } from 'vue';

import { setting } from '@/lib/dexie';
import zy from '@/lib/utils/tools';

import HotView from './Hot.vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  site: {
    type: Object,
    default: () => ({}),
  },
});

const formData = ref(props.site); // 接受父组件参数
const hotList = ref([]); // 热播列表

const searchTxt = ref('');
const isFocus = ref(false);
const isDialogHot = ref(false);

const searchRef = ref(null);

const emit = defineEmits(['search']);

watch(
  () => props.site,
  (val) => {
    formData.value = val;
  },
);

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const handleClickOutside = (event) => {
  const clickedElement = event.target;
  const divElement = searchRef.value;
  if (!divElement.contains(clickedElement)) {
    isFocus.value = false;
  }
};

const getHotList = async () => {
  const defaultHot = await setting.get('defaultHot');
  const { key } = formData.value;

  if (defaultHot === 'site') {
    hotList.value = await zy.hot(key, 24);
  } else if (defaultHot === 'douban') {
    hotList.value = await zy.doubanHot('tv', '热门', 10, 0);
  }
};

const searchHotEvent = (kw) => {
  searchTxt.value = kw;
  searchInputEvent();
};

const searchInputEvent = () => {
  emit('search', searchTxt.value);
  isFocus.value = false;
};

const focusEvent = async () => {
  isFocus.value = true;
  await getHotList();
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';
@import '@/style/index.less';

.hd-search {
  top: 0;
  position: absolute;
  right: 35px;
  left: unset;
  width: auto;
  z-index: 20;
  margin: 0 0 0 35px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 20px;
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background: var(--td-mask-active);
    pointer-events: auto;
  }
  .sh-search {
    width: 200px;
    display: block;
    transition: width 0.2s ease;
  }
  .act {
    width: 518px !important;
  }
  .skin1 {
    background-image: linear-gradient(130deg, rgba(216, 244, 222, 0.3) 0%, rgba(146, 218, 178, 0.2) 100%);
  }
  .hide {
    animation: fs-mask-hide 0.2s ease both;
  }
  .open {
    background-image: linear-gradient(140deg, rgba(146, 218, 178, 0.8) 0%, rgba(244, 244, 255, 0.85) 63%);
  }
  .focus {
    padding-bottom: 12px;
  }

  .hd-search {
    z-index: 9999;
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 25px;
    overflow: hidden;
    font-size: 14px;
    backdrop-filter: blur(40px);
    .hd-search-inner {
      width: 100%;
      display: flex;
      align-items: center;
      .hd-input {
        flex-grow: 1;
        border: none;
        box-sizing: border-box;
        width: 0;
        height: 100%;
        padding-left: 20px;
        background: none;
        outline: none;
        font-size: 14px;
        text-overflow: ellipsis;
        color: var(--td-text-color-primary);
        &:focus ~ .hd-submit {
          color: var(--td-brand-color);
        }
      }
      .search-hotlink {
        color: rgba(255, 255, 255, 0.6);
        display: flex;
        align-items: center;
        flex-shrink: 0;
        height: 100%;
        text-decoration: none;
        &:hover {
          color: var(--td-brand-color);
          .search-hotlink-icon {
            svg {
              color: var(--td-brand-color);
            }
          }
        }
        .search-hotlink-icon {
          width: 14px;
          height: 14px;
          // color: rgba(255, 255, 255, 0.6);
          vertical-align: middle;
        }
      }
      .hd-submit {
        flex-shrink: 0;
        width: 54px;
        height: 45px;
        cursor: pointer;
        display: flex;
        align-items: center;
        padding-left: 16px;
        box-sizing: border-box;
        &:hover {
          color: var(--td-brand-color);
        }
      }
    }
    .hd-result {
      width: 100%;
      max-height: calc(100vh - 75px);
      overflow-x: hidden;
      overflow-y: auto;
      .top-line {
        border-top: 1px solid rgba(0, 0, 0, 0.04);
        margin: 0 20px;
      }

      .search-hot {
        .search-head {
          display: flex;
          justify-content: space-between;
          position: relative;
          margin: 18px 20px 5px;
          overflow: hidden;
          .search-title {
            color: var(--td-text-color-primary);
            font-weight: 600;
          }
        }
        .search-body {
          margin: 12px 16px 0 20px;
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: space-between;

          .num-svg {
            flex-shrink: 0;
            width: 60px;
            color: #fff;
            opacity: 0.3;
            font-weight: 700;
          }

          .txt {
            width: 100px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex-grow: 1;
            line-height: 22px;
            margin-top: 8px;
          }

          a:nth-child(-n + 4) {
            margin-bottom: 20px;
            width: 25%;
          }

          a:nth-child(-n + 4) .num,
          a:nth-child(n + 5) .num-svg {
            display: none;
          }

          a:nth-child(n + 5) {
            width: 50%;
            align-items: center;
            margin-left: -10px;
            .num {
              width: 20px;
              font-size: 18px;
              opacity: 0.4;
              text-align: right;
              font-weight: 700;
              flex-shrink: 0;
              line-height: 18px;
            }
            .name {
              width: auto;
              margin-top: 0;
              margin-left: 9px;
            }
            .info {
              margin-left: 0;
              width: 0;
            }
            .txt {
              width: 100%;
              margin: 0;
              line-height: 18px;
            }
          }

          a:nth-child(n + 5) .pic,
          a:nth-child(n + 5) .remarks {
            display: none;
          }

          a {
            display: flex;
            flex-direction: row;
            margin-bottom: 16px;
            color: var(--td-text-color-primary);
          }

          .info {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            margin-left: -25px;
            z-index: 1;
          }

          .pic {
            width: 64px;
            height: 87px;
            flex-shrink: 0;
            box-shadow: -6px 0 12px 0 rgba(0, 0, 0, 0.4);
            border-radius: 4px;
            overflow: hidden;
            img {
              width: 100%;
              height: 100%;
            }
          }

          .name,
          .remarks {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
          }

          .name {
            font-weight: 700;
          }

          .remarks {
            color: var(--td-text-color-secondary);
          }
        }
      }
    }
  }
}
</style>
