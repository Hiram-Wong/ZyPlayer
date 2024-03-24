import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig, externalizeDepsPlugin, swcPlugin, splitVendorChunkPlugin } from 'electron-vite';
import { ConfigEnv, loadEnv } from 'vite';
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
      build: {
        assetsInclude: ['./src/renderer/src/utils/drpy/drpy3.ts'],
        minify: 'terser',
        emptyOutDir: true, // 打包时先清空上一次构建生成的目录
        reportCompressedSize: false, // 关闭文件计算
        sourcemap: true, // 关闭生成map文件 可以达到缩小打包体积
        terserOptions: {
          // 禁用代码优化
          compress: false,
          mangle: false,
          format: {
            comments: false,
          },
        },
        rollupOptions: {
          treeshake: false, // 关闭代码分割[重要], 否则eval执行时缺少全局变量和方法
          output: {
            entryFileNames: `assets/entry/[name][hash].js`, // 引入文件名的名称
            chunkFileNames: `assets/chunk/[name][hash].js`, // 包的入口文件名称
            assetFileNames: `assets/file/[name][hash].[ext]`, // 资源文件像 字体，图片等
            manualChunks(id) {
              console.log(id)
              if (id.includes("node_modules")) return "vendor_"; //代码分割为第三方包
              if (id.includes("src/renderer/src/utils/drpy")) return "worker_t3_"; //代码分割为worker进程
            }
          }
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
        splitVendorChunkPlugin()
      ],
      server: {
        strictPort: true,
        proxy: {
          [VITE_API_URL_PREFIX]: {
            target: VITE_API_URL,  // 后台接口域名
            changeOrigin: true,  //是否跨域
          }
        }
      }
    }
  }
})
