import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig, externalizeDepsPlugin, swcPlugin } from 'electron-vite';
import { ConfigEnv, loadEnv } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';
import svgLoader from 'vite-svg-loader';

// 按需加载T-Desgin组件
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { TDesignResolver } from 'unplugin-vue-components/resolvers';

const CWD = process.cwd();

// see config at https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
  const { VITE_API_URL, VITE_API_URL_PREFIX } = loadEnv(mode, CWD);
  return {
    main: {
      resolve: {
        alias: {
          '@main': resolve('src/main'),
        },
      },
      build: {
        emptyOutDir: true, // 打包时先清空上一次构建生成的目录
        sourcemap: false, // 关闭生成map文件 可以达到缩小打包体积
        minify: false, // 关闭压缩
        rollupOptions: {
          treeshake: false, // 关闭treeshake
          onwarn: (warning, warn) => {
            if (warning.code === 'EVAL') return; // 忽略 eval 警告
            if (warning.code === 'SOURCEMAP_ERROR') return; // 忽略 sourcemap 错误
            warn(warning);
          },
          input: {
            index: resolve(__dirname, 'src/main/index.ts'),
            worker: resolve(__dirname, 'src/main/core/server/routes/v1/site/cms/adapter/drpy/worker.ts'),
          },
          output: {
            manualChunks: {
              fastify: ['fastify', 'fastify-logger', 'fastify-plugin', '@fastify/cors', '@fastify/multipart'],
              db: ['drizzle-kit', 'drizzle-orm'],
              crypto: ['crypto-js', 'he', 'pako', 'wxmp-rsa'],
            },
          },
          external: [],
        },
      },
      plugins: [externalizeDepsPlugin(), swcPlugin()],
    },
    preload: {
      plugins: [externalizeDepsPlugin()],
    },
    renderer: {
      resolve: {
        alias: {
          '@renderer': resolve('src/renderer'),
          '@': resolve('src/renderer/src'),
        },
      },
      build: {
        emptyOutDir: true, // 打包时先清空上一次构建生成的目录
        sourcemap: false, // 关闭生成map文件 可以达到缩小打包体积
        minify: false, // 关闭压缩
        chunkSizeWarningLimit: 2000, // 打包后超过2kb的会单独打包
        assetsInlineLimit: 4096, // 小于4kb的图片会转成base64
        rollupOptions: {
          output: {
            entryFileNames: `assets/entry/[name]_[hash].js`, // 引入文件名的名称
            chunkFileNames: `assets/chunk/[name]_[hash].js`, // 包的入口文件名称
            assetFileNames: `assets/static/[ext]/[name]_[hash].[ext]`, // 资源文件像 字体，图片等
            manualChunks: {
              'monaco-editor': ['monaco-editor'],
              lodash: ['lodash'],
              xgplayer: [
                'xgplayer',
                'xgplayer-dash',
                'xgplayer-flv',
                'xgplayer-flv.js',
                'xgplayer-hls',
                'xgplayer-hls.js',
                'xgplayer-mp4',
                'xgplayer-shaka',
              ],
              artplayer: ['artplayer', 'artplayer-plugin-danmuku'],
              dplayer: ['dplayer'],
              nplayer: ['nplayer', '@nplayer/danmaku'],
              oplayer: ['@oplayer/core', '@oplayer/plugins', '@oplayer/danmaku', '@oplayer/hls', '@oplayer/ui', '@oplayer/dash', '@oplayer/mpegts', '@oplayer/torrent'],
              'video-decoder': ['dashjs', 'flv.js', 'hls.js', 'mpegts.js','shaka-player'],
              tdesign: ['tdesign-vue-next', 'tdesign-icons-vue-next', '@tdesign-vue-next/chat'],
              md: ['markdown-it', 'highlight.js', 'markdown-it-mathjax3'],
              crypto: ['crypto-js', 'he', 'pako', 'wxmp-rsa'],
              vue: [
                'vue',
                'vue-router',
                'pinia',
                'vue-i18n',
                'pinia-plugin-persistedstate',
                'qrcode.vue',
                'smooth-scrollbar',
                'v3-infinite-loading',
                'mitt',
                '@imengyu/vue3-context-menu',
              ],
            },
          },
        },
      },
      css: {
        preprocessorOptions: {
          less: {
            modifyVars: {
              hack: `true; @import (reference) "${resolve('src/renderer/src/style/variables.less')}";`,
            },
            math: 'strict',
            javascriptEnabled: true,
          },
        },
      },
      plugins: [
        vue({
          template: {
            compilerOptions: {
              isCustomElement: (tag) => tag === 'webview' || tag === 'title-bar',
            },
          },
        }),
        vueJsx(),
        vueDevTools(),
        svgLoader(),
        AutoImport({
          resolvers: [
            TDesignResolver({
              library: 'vue-next',
            }),
          ],
        }),
        Components({
          resolvers: [
            TDesignResolver({
              library: 'vue-next',
            }),
          ],
        }),
      ],
      server: {
        strictPort: true, // 端口冲突自动分配端口
        proxy: {
          [VITE_API_URL_PREFIX]: {
            target: VITE_API_URL, // 后台接口域名
            changeOrigin: true, //是否跨域
          },
        },
      },
    },
  };
});
