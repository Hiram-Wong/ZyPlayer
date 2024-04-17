<p align="center">
<img width="128" src="https://s2.loli.net/2024/02/29/7Q1nVbhkHdSmo5D.png" >
</p>
<p align="center">
<a href="http://zyplayer.fun/" target="_blank">官网</a>
<a href="https://github.com/Hiram-Wong/ZyPlayer/issues" target="_blank">反馈</a>
<a href="https://github.com/Hiram-Wong/ZyPlayer/releases" target="_blank">下载</a>
</p>

<h1 align="center">zyplayer</h1>

基于 electron-vite 框架 + TDesign ui 组件库+ vue3全家桶 开发；主题色：薄荷绿。

# 🎉 特性

- 全平台支持 Windows、Mac、Linux
- 适配深色模式
- 支持资源站 cms（json、xml）
- 支持 IPTV（m3u、genre）及电子节目单
- 支持主流视频平台解析
- 老板键，一键隐藏
- 内置多套播放器

# 🌴 声明

- 请大家支持正版. 所有资源来自网上, 该软件不参与任何制作, 上传, 储存等内容, 禁止传播违法资源.
- 该软件仅供学习交流使用, 禁止个人用于非法商业用途, 请于安装后 24 小时内删除.
- 该软件为空壳播放器, 不带源, 自行研究。
- 该软件部分代码参考[ZY-Player](https://github.com/Hunlongyu/ZY-Player)
- icon 来源于[@fourbeauty]

> 播放器说明: 
- 没有完美的播放器
- 不支持h265(hevc)播放器通常表现为只有声音没有画面
- tcplayer veplayer aliplayer,每次数据都会上报云端
- tcplayer 5.0版本后需要注册账号后才能使用
- h264:tcplayer>xgplayer>dplayer/artplayer  h265:xgplayer 加密:dplayer artplayer tcplayer
- dplayer artplayer 均需基于hls.js和 flv.js

> 包说明: 
- MacOS(dmg)：arm64[Applechip]、x64[Intel]、universal[通用-不区分架构]
- Windows(exe)：arm64[骁龙]、x64[Intel、amd]、ia32(32位操作系统)、win-版本号.exe(通用-不区分架构)
- Linux(image、deb、rpm)：arm64[鲲鹏、飞腾]、x64[兆兴]

> win7说明: 
- [Chromium](https://www.chromium.org/)内核110.0.5481.100对应Electron23.1.1(续航能力的大幅优化 即降低能耗和性能优化)
- Electron 23 将包含 Chromium 110, 不再支持[Windows(7/8/8.1)](https://www.electronjs.org/zh/blog/windows-7-to-8-1-deprecation-notice)
- 维护两套版本成本太高，将随时停止打包[Windows(7/8/8.1)](https://www.electronjs.org/zh/blog/windows-7-to-8-1-deprecation-notice)，用户可自行打包（建议 19.1.9版本）

```shell
1.安装 node.js version18 以上
2.克隆项目  git clone https://github.com/Hiram-Wong/ZyPlayer.git
3.进入项目  cd ZyPlayer/
4.修改packgae.json[仅win8.1、7] "electron": "^19.1.9",
5.安装依赖包  yarn
6.全局安装electron-vite框架 yarn add electron-vite -D
7.打包  yarn build:win[mac/linux]
```

> star history: 

[![Star History Chart](https://api.star-history.com/svg?repos=Hiram-Wong/ZyPlayer&type=Date)](https://star-history.com/#Hiram-Wong/ZyPlayer&Date)


<details>
<summary>展开查看接口说明</summary>

> 配置导入格式(备份数据建议此格式)
```json
{
  "analyze": [
    {
      "id": "fddfb425-6fd9-0b39-459f-a21f69739a6e", // id唯一值不可重复,不能数字,建议 uuid
      "name": "纯净", // 名称
      "url": "https://im1907.top/?jx=", // 解析源地址
      "isActive": true // 是否启用 true启用 false 禁用
    }
  ],
  "iptv": [
    {
      "id": "993841fe-5e91-5e5d-35d6-5be81822960b", // id唯一值不可重复,不能数字,建议 uuid
      "name": "APTV", // 名称
      "url": "https://ghproxy.com/https://raw.githubusercontent.com/Kimentanm/aptv/master/m3u/iptv.m3u", // 直播源地址
      "type": "remote", // remote为远程m3u local本地m3u文件路径
      "isActive": true, // 是否启用 true启用 false 禁用
      "epg": "https://epg.112114.xyz/" // 电子节目单地址
    }
  ],
  "channel": [
    {
      "id": "0ede1ecd-de69-1042-15d9-4e5e9e3bb897", // id唯一值不可重复,不能数字,建议 uuid
      "name": "CCTV6", // 名称
      "url": "http://dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226393/index.m3u8", // 播放地址
      "group": "央视"  // 分组
    }
  ],
  "sites": [
    {
      "id": "51793af6-c923-5504-85db-0ef686624dec", // id唯一值不可重复,不能数字,建议 uuid
      "name": "39影视", // 名称
      "api": "https://www.39kan.com/api.php/provide/vod/",  // 站点源地址
      "playUrl": "", // 配合解析去url地址
      "search": 1, // 0:关闭 1:聚合搜索 2:本站搜索
      "group": "切片", // 分组
      "isActive": true, // 是否启用 true启用 false 禁用
      "type": 1, // 0:cms(xml) 1:cms(json) 2:drpy 3:app(v3) 4:app(v1)
      "ext": "", // 扩展参数
      "categories": "电视,影视" // 按顺序展示所配置的分类 不配置则默认展示所有分类
    },
  ],
  "drive": [
    {
      "id": "3293dc45-cf14-9c66-3028-5b7765b240b7", // id唯一值不可重复,不能数字,建议 uuid
      "name": "🙋丫仙女",  // 名称
      "server": "http://alist.xiaoya.pro/",  // 网盘地址
      "startPage": "",  // 开始页路径
      "search": false,  // 是否支持搜索 true启用 false 禁用
      "headers": null,  // 请求头
      "params": null,  // 参数
      "isActive": true // 是否启用 true启用 false 禁用
    }
  ],
  "setting": [
    {
      "version": "3.3.2", // [3.3.2版本启用]当前版本 (一定要根据实际填写,不然数据库执行会报错)
      "theme": "auto",  // 主题 auto:跟随系统 light:亮色 dark:暗色
      "lang": "zh_CN",  // [3.3.4版本启用]语言 zh_CN:中文 en_US:英文
      "defaultHot": "kylive",  // 热搜 kylive:酷云数据 enlightent:云合数据
      "defaultSearchRecommend": "site", // 搜索推荐 site:站点 quark:夸克 baidu:百度 douban:豆瓣  弃用
      "defaultSearchType": "site", // 全局搜索模式 site:本站 group:组内 all:全部
      "defaultCheckModel": true,  // [弃用] 忘了干嘛的
      "defaultChangeModel": false,  // [弃用] 忘了干嘛的
      "pauseWhenMinimize": false,  // [弃用] 最小化时暂停
      "defaultIptvEpg": "https://epg.112114.eu.org/", // iptv epg
      "defaultIptvLogo": "https://epg.112114.eu.org/logo/", // iptv logo
      "iptvSkipIpv6": true, // iptv是否跳过ipv6节目
      "iptvThumbnail": true, // iptv是否显示缩略图
      "iptvStatus": true, // iptv是否检测延迟
      "defaultSite": "51793af6-c923-5504-85db-0ef686624dec", // site 默认源标识
      "defaultIptv": "993841fe-5e91-5e5d-35d6-5be81822960b", // iptv 默认源标识
      "defaultAnalyze": "fddfb425-6fd9-0b39-459f-a21f69739a6e", // analyze 默认源标识
      "defaultDrive": "3293dc45-cf14-9c66-3028-5b7765b240b7", // drive 默认源标识
      "defaultViewCasual": "", // [3.3.4版本启用]随性看地址
      "analyzeFlag": [
        "youku",
        "qq",
        "iqiyi",
        "qiyi",
        "letv",
        "sohu",
        "tudou",
        "pptv",
        "mgtv"
      ],  // 解析标识
      "broadcasterType": "xgplayer", // [3.3.4版本弃用,使用playerMode参数]播放器 xgplayer:西瓜 dplayer:呆呆 custom:自定义结合externalPlayer
      "externalPlayer": "", // [3.3.4版本弃用,使用playerMode参数]播放器为custom,调用此处系统命令
      "playerMode": {
        "type": "xgplayer",  // 播放器 xgplayer:西瓜 dplayer:呆呆 custom:自定义结合external
        "external": ""  // 播放器为custom,调用此处系统命令
      },  // [3.3.4版本启用]
      "softSolution": false, // 是否使用软解 预留
      "communitySubscribe": "", // 社区地址 预留
      "skipStartEnd": false, // 是否跳过首尾空白
      "agreementMask": true, // 是否同意协议
      "recordShortcut": "Shift+Command+Z", // 录制快捷键
      "snifferType" : "pie",  // [3.3.4版本弃用,使用snifferMode参数]嗅探模式 pie iframe
      "snifferMode": {
        "type": "pie",  // 嗅探模式 pie iframe custom
        "url": ""  // 当 type 为 custom 时填写自定义地址
      },  // [3.3.4版本启用]
      "selfBoot": false,  // 是否开机自启动
      "hardwareAcceleration": true,  // 是否启用硬件加速
      "ua": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",  // UA
      "webdevUrl": "https://dav.jianguoyun.com/dav/",  // [3.3.4版本弃用,使用webdev参数]webdev同步盘地址 用于备份
      "webdevUsername": "",  // [3.3.4版本弃用,使用webdev参数]webdev用户名 用于备份
      "webdevPassword": "",  // [3.3.4版本弃用,使用webdev参数]webdev密码 用于备份
      "webdev": {
        "sync": false,  // 自动同步
        "data": {
          "url": "https://dav.jianguoyun.com/dav/",
          "user": "",
          "password": ""
        }  // webdev 用于备份
      },  // [3.3.4版本启用]
      "restoreWindowPositionAndSize" : false, // 弃用
      "windowPosition": {
        "status": false,  // 是否记录窗口位置
        "position": {
          "width": 1000,
          "height": 640
        }  // 窗口位置
      }
    }
  ]
}
```

> 一键配置格式(初次使用建议此格式, 仅支持导入源数据和设置默认源标识)
```json
{
  "analyze": {
    "default": "fddfb425-6fd9-0b39-459f-a21f69739a6e", // 默认标识 对应需设置为默认的id
    "data": [
      {
        "id": "fddfb425-6fd9-0b39-459f-a21f69739a6e", // id唯一值不可重复,不能数字,建议 uuid
        "name": "纯净", // 名称
        "url": "https://im1907.top/?jx=", // 解析源地址
        "isActive": true // 是否启用 true启用 false 禁用
      }
    ]
  },
  "iptv": {
    "default": "993841fe-5e91-5e5d-35d6-5be81822960b", // 默认标识 对应需设置为默认的id
    "data": [
      {
        "id": "993841fe-5e91-5e5d-35d6-5be81822960b", // id唯一值不可重复,不能数字,建议 uuid
        "name": "APTV", // 名称
        "url": "https://ghproxy.com/https://raw.githubusercontent.com/Kimentanm/aptv/master/m3u/iptv.m3u", // 直播源地址
        "type": "remote", // remote为远程m3u local本地m3u文件路径
        "isActive": true, // 是否启用 true启用 false 禁用
        "epg": "https://epg.112114.xyz/" // 电子节目单地址
      }
    ]
  },
  "sites":  {
    "default": "51793af6-c923-5504-85db-0ef686624dec", // 默认标识 对应需设置为默认的id
    "data": [
      {
        "id": "51793af6-c923-5504-85db-0ef686624dec", // id唯一值不可重复,不能数字,建议 uuid
        "name": "39影视", // 名称
        "api": "https://www.39kan.com/api.php/provide/vod/",  // 站点源地址
        "playUrl": "", // 配合解析去url地址
        "search": 1, // 0:关闭 1:聚合搜索 2:本站搜索
        "group": "切片", // 分组
        "isActive": true, // 是否启用 true启用 false 禁用
        "type": 1, // 0:cms(xml) 1:cms(json) 2:drpy 3:app(v3) 4:app(v1)
        "ext": "", // 扩展参数
        "categories": "电视,影视" // 按顺序展示所配置的分类 不配置则默认展示所有分类
      }
    ]
  },
  "drive":  {
    "default": "3293dc45-cf14-9c66-3028-5b7765b240b7", // 默认标识 对应需设置为默认的id
    "data": [
      {
        "id": "3293dc45-cf14-9c66-3028-5b7765b240b7", // id唯一值不可重复,不能数字,建议 uuid
        "name": "🙋丫仙女",  // 名称
        "server": "http://alist.xiaoya.pro/",  // 网盘地址
        "startPage": "",  // 开始页路径
        "search": false,  // 是否支持搜索 true启用 false 禁用
        "headers": null,  // 请求头
        "params": null,  // 参数
        "isActive": true // 是否启用 true启用 false 禁用
      }
    ]
  }
}
```
</details>

<details>
<summary>展开查看软件截图</summary>

|                           影视(首页)                           |                             影视(搜索)                             |
| :-------------------------------------------------------------: | :-----------------------------------------------------------------: |
| ![影视](https://s2.loli.net/2024/02/29/XvoZTeLMDAz87N5.png) | ![影视搜索](https://s2.loli.net/2024/02/29/kb5Hs9hfuBeVaY1.png) |
|                           影视(播放)                           |                             影视 (介绍)                             |
| ![影视播放](https://s2.loli.net/2023/05/07/fgmbdXQvPE73WCY.png) |   ![影视详情](https://s2.loli.net/2024/03/18/hIYEDRKmOrQq4ya.png)   |
|                          网盘                           |                             直播(首页)                              |
| ![网盘](https://s2.loli.net/2024/02/29/CpNc4wisOgKQbSM.png) |   ![直播首页](https://s2.loli.net/2024/02/29/hpCKzaD7ryWAqY9.png)   |
|                           直播(播放)                            |                                解析                                 |
| ![直播播放](https://s2.loli.net/2024/02/29/aS8UgwBsVNeDzvi.png) |     ![解析](https://s2.loli.net/2024/02/29/3mef2sdDrXoqtjW.png)     |
|                            历史记录                             |                                在追                                 |
| ![历史](https://s2.loli.net/2024/02/29/IN2bE5PHSdgew7l.png) |     ![在追](https://s2.loli.net/2024/02/29/EWryHtxd5TZliO6.png)     |

</details>