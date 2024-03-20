import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig, externalizeDepsPlugin, swcPlugin } from 'electron-vite';
import { ConfigEnv, loadEnv } from 'vite';
import svgLoader from 'vite-svg-loader';

// 按需加载T-Desgin组件
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { TDesignResolver } from 'unplugin-vue-components/resolvers';


// see config at https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
  // 读取环境变量
  const getEnv = (name: string) => {
    return loadEnv(mode, process.cwd())[name];
  }
  return {
    main: {
      resolve: {
        alias: {
          '@main': resolve('src/main')
        }
      },
      build: {
        rollupOptions: {
          external: ['sqlite3']
        }
      },
      plugins: [
        externalizeDepsPlugin(),
        swcPlugin()
      ]
    },
    preload: {
      plugins: [externalizeDepsPlugin()]
    },
    renderer: {
      resolve: {
        alias: {
          '@renderer': resolve('src/renderer'),
          '@': resolve('src/renderer/src')
        }
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
              isCustomElement: (tag) => tag === 'webview',
            },
          },
        }),
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
      ],
      server: {
        strictPort: true,
        proxy: {
          '/api': {
            target: 'http://127.0.0.1:9978',  // 后台接口域名
            changeOrigin: true,  //是否跨域
          }
        }
      }
    }
  }
})
