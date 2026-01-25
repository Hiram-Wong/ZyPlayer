import { resolve } from 'node:path';

import { TDesignResolver } from '@tdesign-vue-next/auto-import-resolver';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'electron-vite';
import { visualizer } from 'rollup-plugin-visualizer';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ViteImageOptimizer as viteImageOptimizer } from 'vite-plugin-image-optimizer';
import viteVueDevTools from 'vite-plugin-vue-devtools';
import viteSvgLoader from 'vite-svg-loader';

import pkg from './package.json';

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

const visualizerPlugin = (type: 'renderer' | 'main') => {
  return process.env[`VISUALIZER_${type.toUpperCase()}`] ? [visualizer({ open: true })] : [];
};

/**
 * @see https://vitejs.dev/config/
 * @see https://rolldown.rs/reference/config-options/
 */
export default defineConfig({
  main: {
    plugins: [...visualizerPlugin('main')],
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@shared': resolve('packages/shared'),
        '@logger': resolve('src/main/services/LoggerService'),
        '@db': resolve('src/main/services/DatabaseService'),
        '@server': resolve('src/main/services/FastifyService'),
        '@pkg': resolve('package.json'),
      },
    },
    build: {
      rollupOptions: {
        external: ['bufferutil', 'utf-8-validate', 'electron', ...Object.keys(pkg.dependencies)],
        input: {
          index: resolve(__dirname, 'src/main/index.ts'),
          film_cms_adapter_t3_drpy_worker: resolve(
            __dirname,
            'src/main/services/FastifyService/routes/v1/film/cms/adapter/t3Drpy/worker.ts',
          ),
        },
        onwarn: (warning, defaultHandler) => {
          // TODO: We should resolve these warnings instead of ignoring them
          switch (warning.code) {
            case 'EVAL':
            case 'SOURCEMAP_ERROR':
            case 'COMMONJS_VARIABLE_IN_ESM':
              return;
            default:
              break;
          }

          // Handle all other warnings normally
          defaultHandler(warning);
        },
        output: {
          manualChunks: undefined, // Disable code splitting completely-return null to force single file packaging
          inlineDynamicImports: true, // Inline all dynamic imports, this is a key configuration
          format: 'cjs',
        },
        treeshake: false,
      },
      externalizeDeps: {},
      sourcemap: isDev,
    },
    esbuild: isProd ? { legalComments: 'none' } : {},
    optimizeDeps: {
      noDiscovery: isDev,
    },
    worker: {
      format: 'es',
    },
  },
  preload: {
    plugins: [],
    resolve: {
      alias: {
        '@shared': resolve('packages/shared'),
        '@pkg': resolve('package.json'),
      },
    },
    build: {
      sourcemap: isDev,
    },
  },
  renderer: {
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => ['webview'].includes(tag),
          },
        },
      }),
      vueJsx({
        transformOn: true,
        // oxc: true,
      }),
      AutoImport({
        resolvers: [
          TDesignResolver({
            library: 'vue-next',
          }),
          TDesignResolver({
            library: 'chat',
          }),
        ],
      }),
      Components({
        resolvers: [
          TDesignResolver({
            library: 'vue-next',
          }),
          TDesignResolver({
            library: 'chat',
          }),
        ],
      }),
      viteImageOptimizer(),
      viteSvgLoader(),
      viteVueDevTools(),
      ...visualizerPlugin('renderer'),
    ],
    resolve: {
      alias: {
        '@': resolve('src/renderer/src'),
        '@pkg': resolve('package.json'),
        '@renderer': resolve('src/renderer'),
        '@shared': resolve('packages/shared'),
        '@logger': resolve('src/main/services/LoggerService'),
      },
    },
    optimizeDeps: {
      include: ['monaco-yaml/yaml.worker.js'],
      esbuildOptions: {
        target: 'esnext', // for dev
      },
    },
    worker: {
      format: 'es',
    },
    build: {
      target: 'esnext', // for build
      rollupOptions: {
        external: ['worker_threads', 'crypto'],
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
        },
        output: {
          entryFileNames: `assets/entry/[name]_[hash].js`,
          chunkFileNames: `assets/chunk/[name]_[hash].js`,
          assetFileNames: `assets/static/[ext]/[name]_[hash].[ext]`,
          advancedChunks: {
            groups: [
              {
                name: 'vendor_tdesign',
                test: /[\\/]node_modules[\\/](tdesign-vue-next|tdesign-icons-vue-next|@tdesign-vue-next\/chat)[\\/]/,
              },
              {
                name: 'vendor_vue',
                test: /[\\/]node_modules[\\/](vue|vue-router|vue-i18n|pinia|pinia-plugin-persistedstate|pinia-shared-state|@vueuse\/core|v3-infinite-loading|emittery)[\\/]/,
              },
              {
                name: 'vendor_crypto',
                test: /[\\/]node_modules[\\/](crypto-js|he|pako|node-forge|sm-crypto-v2|uuid)[\\/]/,
              },
              {
                name: 'vendor_video-decoder',
                test: /[\\/]node_modules[\\/](dashjs|flv\.js|hls\.js|mpegts\.js|shaka-player)[\\/]/,
              },
              {
                name: 'vendor_xgplayer',
                test: /[\\/]node_modules[\\/](xgplayer|xgplayer-.*)[\\/]/,
              },
              {
                name: 'vendor_artplayer',
                test: /[\\/]node_modules[\\/](artplayer|artplayer-.*)[\\/]/,
              },
              {
                name: 'vendor_dplayer',
                test: /[\\/]node_modules[\\/]dplayer[\\/]/,
              },
              {
                name: 'vendor_nplayer',
                test: /[\\/]node_modules[\\/](nplayer|@nplayer\/.*)[\\/]/,
              },
              {
                name: 'vendor_oplayer',
                test: /[\\/]node_modules[\\/]@oplayer[\\/]/,
              },
            ],
          },
        },
        experimental: {
          strictExecutionOrder: true,
        },
        onwarn: (warning, defaultHandler) => {
          // TODO: We should resolve these warnings instead of ignoring them
          switch (warning.code) {
            case 'EVAL':
            case 'COMMONJS_VARIABLE_IN_ESM':
            case 'PLUGIN_TIMINGS':
              return;
            default:
              break;
          }

          // Handle all other warnings normally
          defaultHandler(warning);
        },
      },
    },
    esbuild: isProd ? { legalComments: 'none' } : {},
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
  },
});
