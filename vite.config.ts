// import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from '@vitejs/plugin-vue-jsx';
import path from 'path';
// 按需加载T-Desgin组件
import AutoImport from 'unplugin-auto-import/vite';
import { TDesignResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { ConfigEnv, loadEnv, UserConfig } from 'vite';
import viteImagemin from 'vite-plugin-imagemin';
// 通过触发冷启动时的预构建来解决
import OptimizationPersist from 'vite-plugin-optimize-persist';
import PkgConfig from 'vite-plugin-package-config';
import svgLoader from 'vite-svg-loader';

const CWD = process.cwd(path.resolve(__dirname, './src'));
console.log()
// https://vitejs.dev/config/
export default ({ mode }: ConfigEnv): UserConfig => {
  const { VITE_BASE_URL } = loadEnv(mode, CWD);
  return {
    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    // prevent vite from obscuring rust errors
    clearScreen: false,
    // tauri expects a fixed port, fail if that port is not available
    server: {
      port: 1420,
      strictPort: true,
    },
    // to make use of `TAURI_DEBUG` and other env variables
    // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
    envPrefix: ["VITE_", "TAURI_"],
    build: {
      emptyOutDir: true, // 打包时先清空上一次构建生成的目录
      reportCompressedSize: false, // 关闭文件计算
      // Tauri supports es2021
      target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
      // don't minify for debug builds
      minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
      // produce sourcemaps for debug builds
      sourcemap: !!process.env.TAURI_DEBUG,
    },
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
    
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag === 'webview',
          },
        },
      }),
      // PkgConfig(),
      // OptimizationPersist(),
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
      })
    ]
  }
};
