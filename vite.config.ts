import path from 'node:path';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
// 按需加载T-Desgin组件
import AutoImport from 'unplugin-auto-import/vite';
import { TDesignResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { ConfigEnv, loadEnv, UserConfig } from 'vite';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import viteImagemin from 'vite-plugin-imagemin';
// 通过触发冷启动时的预构建来解决
import OptimizationPersist from 'vite-plugin-optimize-persist';
import PkgConfig from 'vite-plugin-package-config';
import svgLoader from 'vite-svg-loader';

import { dependencies } from './package.json';

const CWD = process.cwd();

// https://vitejs.dev/config/
export default ({ mode }: ConfigEnv): UserConfig => {
  const { VITE_BASE_URL } = loadEnv(mode, CWD);
  return {
    base: VITE_BASE_URL,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            hack: `true; @import (reference) "${path.resolve('src/style/variables.less')}";`,
          },
          math: 'strict',
          javascriptEnabled: true,
        },
      },
    },

    build: {
      emptyOutDir: true, // 打包时先清空上一次构建生成的目录
      reportCompressedSize: false, // 关闭文件计算
      sourcemap: false, // 关闭生成map文件 可以达到缩小打包体积

      rollupOptions: {
        output: {},
      },
    },

    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag === 'webview',
          },
        },
      }),
      PkgConfig(),
      OptimizationPersist(),
      vueJsx(),
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
      viteImagemin({
        gifsicle: { optimizationLevel: 3, interlaced: true },
        mozjpeg: { quality: 75, progressive: true },
        optipng: { optimizationLevel: 7 },
        pngquant: { quality: [0.65, 0.9], speed: 4 },
        webp: { quality: 75 },
      }),
      electron([
        {
          entry: 'electron/main/index.ts',
          onstart(options) {
            if (process.env.VSCODE_DEBUG) {
              console.log('[startup] Electron App');
            } else {
              options.startup();
            }
          },
          vite: {
            build: {
              outDir: 'dist-electron/main',
              rollupOptions: {
                external: Object.keys(dependencies ?? {}),
              },
            },
          },
        },
        {
          entry: 'electron/preload/index.ts',
          onstart(options) {
            // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
            // instead of restarting the entire Electron App.
            options.reload();
          },
          vite: {
            build: {
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external: Object.keys(dependencies ?? {}),
              },
            },
          },
        },
      ]),
      renderer(),
    ],
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
  };
};
