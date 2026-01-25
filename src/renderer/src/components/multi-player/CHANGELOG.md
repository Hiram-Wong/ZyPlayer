# Changelog


## 2026.1.17

- 修复xgplayer无法加载音乐类型
- 修复xgplayer音乐模式下图标替换
- 修复创建播放器mode为new时在已有播放器的情况下找不到dom问题
- 微调图标svg

## 2025.12.30

- 修复oplayer加载弹幕后摧毁报错(官方方案)

## 2025.12.26

- 重构弹幕加载/切换函数
- 优化创建逻辑, 优先switchUrl后create
- 修复create可能存在的参数冲突问题
- 修复artplayer全屏部分样式冲突
- 修复dplayer请求头丢失
- 修复oplayer加载弹幕后摧毁报错(临时补丁)
  ```ts
  diff --git a/dist/index.es.js b/dist/index.es.js
  index ce634bbd4551b0d7519eaf297d69b245aa2b2545..81b450fa4631365e7e256a32deabebbcf7d6d345 100644
  --- a/dist/index.es.js
  +++ b/dist/index.es.js
  @@ -1126,7 +1126,7 @@ function renderSetting(it) {
      panels[0].$ref.classList.add(activeCls);
      function outClickListener(e) {
        if (!$dom.contains(e.target)) {
  -        player.$root.classList.remove(settingShown);
  +        player.$root?.classList?.remove(settingShown);
          panels.forEach(($p) => $p.$ref.classList.remove(activeCls));
          document.removeEventListener("click", outClickListener);
        }
  ```
- 调整ts类型标注

## 2025.7.27

- 删除检查网络状态(getNetworkCircuitType)方法
- i18n获取取主程序store
- 网络请求
- 修复artplayer摧毁webtorrent后无法使用
- webtorrent链接缺少tr时自动添加公共tracker
- 修复xgplayer一处解码器条件错误
- 删除shaka解码器与dash重合(除xg-shaka)

## 2025.7.4

- 修复批导入图标语法告警[query: '?raw' -> as: 'raw']

## 2025.6.25

- 修复 xgplayer 切换画质渲染名称不变问题

## 2025.6.24

- 优化媒体/存储工具库
- 修复摧毁后重建国际化不生效
- dplayer|artplayer|nplayer 创建时均清除自带的数据记忆-防止storage冲突
- 修复xgplayer dplayer摧毁后dom被添加运行时属性
- github:Hiram-Wong/DPlayer
  - 支持i18n
  - 修复摧毁时触发倍速为1
  - 修复静音操作不会同步ui
  - 修复弹幕库未初始化触发switchVideo无效
  - 修复播放按钮dom结构不一致

## 2025.6.23

- 修复多处 seek 方法失效
- 修复nplayer倍速/音量/静音不记忆
- 新增 volume rate muted setMuted toggleMuted 方法

## 2025.6.22

- 微调图标svg和样式
- 修复部分按钮滑动触发的面板无法控制

## 2025.6.21

- 弹幕数据简单过滤并排序避免部分播放器加载失败
- dplayer弹幕使用 url+blob / apiBackend 实现-之前依赖后端

## 2025.6.20

- 修复@oplayer/torrent和webtorrent未同时安装冲突[vite环境下@oplayer/torrent动态导入库导致]
- 修复shaka-player解码库提示错误-error TS2306: File '/node_modules/shaka-player/dist/shaka-player.compiled.d.ts' is not a module
- mpegts库调整 官方 -> github:tsukumijima/mpegts.js
- dplayer库调整 官方 -> github:tsukumijima/DPlayer -> [自维护-部分特性提交给上游]-github:Hiram-Wong/DPlayer

## 2025.6.19

- 对齐方法名
- 对齐弹幕参数-字体大小透明度等
- 拆分部分文件函数
- 新增头部插槽
- 修复调用组件方法报方法不存在

## 2025.6.18

- 修复artplayer静音监听事件缺少数据来源
- 修复oplayer弹幕清空事件
- 修复xgplayer下集类型匹配错误
- 修复artplayer新版弹幕库发送事件不兼容
- 修复artplayer音量不同步-需篡改原有存储
- 修复nplayer静音不同步-需设置volume替代muted
- 修复oplayer起始进度跳转失败
- nplayer i18n支持
- nplayer|dplayer 下集emitter

## 2025.2.26

- 修复oplayer不支持请求头问题
- 修复formatUrlHeaders数据类型错误导致播放地址拼接失败
- 修复formatUrlHeaders方法value拼写错误

## 2025.2.25

- 修复oplayer下一集显示后无法摧毁
- 修复oplayer弹幕问题
- 修复oplayer方法create类型switch缺失break
- 修复xgplayer多语言映射错误导致倍速显示undefined
- 修复artplayer|oplayer方法playNext入参错误
- 自定义播放器样式各自导入不再整体导入
- 微调图标svg和样式

## 2025.2.24

- 集成oplayer(下一集显示bug, 弹幕逻辑天坑)

## 2025.1.25

- 精简集成(移除nplayer|dplayer)
- artplayer|xgplayer i18n支持
- artplayer|xgplayer 下集emitter

## 2024.12.24

- 视频质量(dplayer切换会丢失视频原有属性, nplayer 不支持)
- 提取formatRemoveUnSafeHeaders, formatUrlHeaders方法
- headers前端剔除不安全请求头, 拦截符遇=改为$*&
- getMediaType方法加入请求头

## 2024.12.14

- tsx组件化
- 业务代码解耦合
- dp播放器销毁监听会触发多次摧毁导致报错
- 集成媒体类型类工具(检测|映射)
- 修复webtorrent摧毁失败

## 2024.11.7

- 弹幕字母拼写错误

## 2024.10.28

- 重写所有适配器-改为class适配器
- 共享记忆数据,并初始化设置

## 2024.7.1

- 扩展dplayer播放器缺失once方法
- 重写dplayer播放器destroy方法-始终会释放playrate为1的信号

## 2024.6.30

- 优化记忆音量和倍速(遗留art播放器UI显示不对bug-已提issue)-存储localStorage
- 统一倍速为[0.5, 0.75, 1, 1.25, 1.5, 2]

## 2024.6.29

- 修复在live模式下切换下一个报错-需判断弹幕组件库是否加载
- 修复flv数据流切换失败, 始终播放一个视频流
- 统一调用公共逻辑摧毁实例(除西瓜播放器外)
- 去除nplayer控制条调用画中画(遗留多次创建会创建多个dom问题bug)

## 2024.6.4

- 修复西瓜播放器加载视频错误
- 修复多次创建播放器扩展插件会重复添加-默认参数使用深拷贝

## 2024.6.3

- 支持mp3|m4a音频-使用MPEG-TS库

## 2024.6.2

- 修复mpd无法播放问题-类型映射
- 修复xgplayer初始化播放器失败-plugin赋值错误
- 优化mpd播放-使用shaka库替代dash库[dash库经常卡死|反复请求同一分片]
- 修复artplayer弹幕库5.1版本-参数对齐
- 修复nplayer弹幕不滚动-BulletOption中type赋值错误
- 修复dplayer弹幕控制不生效-弹幕开关控制逻辑误删

## 2024.6.1

- 修复playerNext方法nplayer类型为mp4不生效
- 统一风格-nplayer音量进度条改为垂直|扩展画中画控制栏显示|live模式去进度条
- 统一风格-live模式去除相关弹幕组件

## 2024.5.25

- 动态异步加载依赖
- 按播放器解耦

## 2024.5.16

- 扩展dplayer画中画功能、控制栏弹幕开关
- 调整dplayer参数unlimited为false-解决阻塞主进程问题
- 修复触发playerNext方法在触发playerBarrage方法切换失败-没有赋值dp.options.video.src导致地址一直不变

## 2024.5.15

- 修复取消监听事件导致组件内监听事件失效-提取为公共方法[时间变动|弹幕发送]
- 修复自定义dplayer的off传入func匹配错误

## 2024.5.14

- 优化公共流逻辑-先检测环境是否支持
- 修复seek方法xgplayer进度跳转失败
- 修复playerNext方法nplayer会退出全屏

## 2024.5.13

- 除xgplayer外增加弹幕发送逻辑
- 优化xgplayer兼容性-xgplayer-flv.js替代xgplayer-flv, xgplayer-hls.js替代xgplayer-hls

## 2024.5.12

- 初步实现方法集成[xgplayer|nplayer|dplayer|artplayer]
