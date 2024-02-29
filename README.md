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
4.修改packgae.json "electron": "^19.1.9",
5.安装依赖包  yarn
6.打包  yarn electron:build:win[mac/linux]
```

<details>
<summary>展开查看接口说明</summary>

> 一键格式
```json
{
  "analyze": [
    {
      "id": 1, // id 唯一值不可重复, 建议 uuid
      "name": "纯净", // 名称
      "url": "https://im1907.top/?jx=", // 解析源地址
      "isActive": true // 是否启用 true启用 false 禁用
    }
  ],
  "iptv": [
    {
      "id": 1, // id 唯一值不可重复, 建议 uuid
      "name": "APTV", // 名称
      "url": "https://ghproxy.com/https://raw.githubusercontent.com/Kimentanm/aptv/master/m3u/iptv.m3u", // 直播源地址
      "type": "remote", // remote为远程m3u local本地m3u文件路径
      "isActive": true, // 是否启用 true启用 false 禁用
      "epg": "https://epg.112114.xyz/" // 电子节目单地址
    }
  ],
  "channel": [
    {
      "name": "CCTV1",
      "url": "http://hms304nc1972679586.live.aikan.miguvideo.com/wh7f454c46tw3831204341_1349411946/wd_r2/cctv/cctv1hd/2500/01.m3u8?msisdn=19115966146&Channel_ID=0119_04102000-99000_400300000040002&client_ip=182.149.232.3&timestamp=20230115080246&ContentId=265183188&timezone=UTC&mtv_session=01b97ad3f1d61532d8f0d40578ee3f47&HlsSubType=1&HlsProfileId=1&nphaid=0&encrypt=ac6f75650a73ab06efc36233598f26b8",
      "group": "央视",
      "id": 5821 // id 唯一值不可重复, 建议 uuid
    }
  ],
  "sites": [
    {
      "name": "39影视",  // 名称
      "api": "https://www.39kan.com/api.php/provide/vod/",  // 站点源地址
      "playUrl": "", // 配合解析去url地址
      "search": 1, // 0:关闭 1:聚合搜索 2:本站搜索
      "group": "切片", // 分组
      "status": false, //  已经弃用该参数
      "isActive": true, // 是否启用 true启用 false 禁用
      "type": 1,  // 0:cms(xml) 1:cms(json) 2:drpy 3:app(v3) 4:app(v1)
      "id": 1,  // id 唯一值不可重复, 建议 uuid
      "categories": "电视,影视" // 按顺序展示所配置的分类 不配置则默认展示所有分类
    },
  ],
  "setting": [
    {
      "version": 0, // 当前版本
      "theme": "auto",
      "externalPlayer": "",
      "defaultHot": "kylive",
      "defaultSearchRecommend": "site",
      "defaultSearchType": "site",
      "defaultCheckModel": true,
      "defaultChangeModel": false,
      "defaultIptvEpg": "https://epg.112114.eu.org/",
      "defaultIptvLogo": "https://epg.112114.eu.org/logo/",
      "iptvSkipIpv6": true,
      "iptvThumbnail": true,
      "defaultSite": 3,
      "defaultIptv": 5,
      "defaultAnalyze": 2,
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
      ],
      "broadcasterType": "iina",
      "softSolution": false,
      "skipStartEnd": false,
      "agreementMask": true,
      "recordShortcut": "Shift+Command+Z",
      "selfBoot": false,
      "hardwareAcceleration": true,
      "ua": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
      "iptvStatus": true,
      "webdevUrl": "https://dav.jianguoyun.com/dav/",
      "webdevUsername": "",
      "webdevPassword": "",
      "windowPosition": {
        "status": false,
        "position": {
            "width": 1000,
            "height": 640
        }
      }
    }
  ],
}
```
</details>

<details>
<summary>展开查看软件截图</summary>

|                           影视(首页)                           |                             影视(搜索)                             |
| :-------------------------------------------------------------: | :-----------------------------------------------------------------: |
| ![影视](https://s2.loli.net/2024/02/29/XvoZTeLMDAz87N5.png) | ![影视搜索](https://s2.loli.net/2024/02/29/kb5Hs9hfuBeVaY1.png) |
|                           影视(播放)                           |                             影视 (介绍)                             |
| ![影视播放](https://s2.loli.net/2023/05/07/fgmbdXQvPE73WCY.png) |   ![影视详情](https://s2.loli.net/2023/05/07/LrJY4EVK5WhZ3XR.png)   |
|                          网盘                           |                             直播(首页)                              |
| ![网盘](https://s2.loli.net/2024/02/29/CpNc4wisOgKQbSM.png) |   ![直播首页](https://s2.loli.net/2024/02/29/hpCKzaD7ryWAqY9.png)   |
|                           直播(播放)                            |                                解析                                 |
| ![直播播放](https://s2.loli.net/2024/02/29/aS8UgwBsVNeDzvi.png) |     ![解析](https://s2.loli.net/2024/02/29/3mef2sdDrXoqtjW.png)     |
|                            历史记录                             |                                在追                                 |
| ![历史](https://s2.loli.net/2024/02/29/IN2bE5PHSdgew7l.png) |     ![在追](https://s2.loli.net/2024/02/29/EWryHtxd5TZliO6.png)     |

</details>