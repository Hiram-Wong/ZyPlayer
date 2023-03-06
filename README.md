<p align="center">
<img width="128" src="https://user-images.githubusercontent.com/54350573/132035179-5a7f2160-c27f-47d6-ad86-a644b360b3ee.png" >
</p>
<p align="center">
<a href="http://zyplayer.fun/" target="_blank">官网</a>
<a href="https://github.com/Hiram-Wong/ZyPlayer/issues" target="_blank">反馈</a>
<a href="https://github.com/Hiram-Wong/ZyPlayer/releases" target="_blank">下载</a>
</p>

<h1 align="center">ZYPlayer</h1>

### Introduction

基于 vue 全家桶 + tdesign + electron 开发；主题色：薄荷绿。

🎨 已有功能

- 全平台支持 Windows、Mac、Linux
- 适配黑暗模式
- 支持资源站 cms（json 接口）
- 支持 IPTV（m3u、genre）及电子节目单
- 支持主流视频平台解析（解析页面有个小彩蛋，可在代码里自行探索）
- 老板键，一键隐藏
- 播放器软解
- ...

### 🌴 声明

- 请大家支持正版. 所有资源来自网上, 该软件不参与任何制作, 上传, 储存等内容, 禁止传播违法资源.
- 该软件仅供学习交流使用，禁止个人用于非法商业用途, 请于安装后 24 小时内删除.
- 核软件为空壳播放器，不带源。
- 核软件部分代码参考[ZY-Player](https://github.com/Hunlongyu/ZY-Player)
- icon 来源于[ZY Player Issues 737](https://github.com/Hunlongyu/ZY-Player/issues/737)

### 🧤 格式

> 资源站点接口格式

```json
[
  {
    "id": 1,
    "key": "39kan",
    "name": "39影视",
    "api": "https://www.39kan.com/api.php/provide/vod/",
    "type": 1,
    "jiexiUrl": "",
    "group": "影视",
    "isActive": true,
    "status": true,
    "reverseOrder": false
  }
]
```

> iptv 站点接口格式

```json
[
    {
    "id": 1,
    "name": "APTV",
    "url": "https://raw.githubusercontent.com/Kimentanm/aptv/master/m3u/iptv.m3u",
    "epg": "",
    "isActive": true
  }
]
```

> 解析站点接口格式

```json
[
  {
    "id":1,
    "name":"xxx",
    "url":"https://jx.aidouer.net/?url=",
    "isActive": true
  }
]
```

### 🎠 平台

| 平台                                   | 链接                                                        |
| :------------------------------------- | :---------------------------------------------------------- |
| 🖥️ 电脑端旧 ( Windows & Mac & Linux )  | [ZY Player Old](https://github.com/Hunlongyu/ZY-Player)     |
| 🖥️ 电脑端新 ( Windows & Mac & Linux )  | [ZY Player New](https://github.com/Hiram-Wong/ZyPlayer)     |
| 📱 手机端 ( Android & IOS )            | [ZY Player APP](https://github.com/Hunlongyu/ZY-Player-APP) |
| 📺 电视端 ( Android & Mac ) ( 进行中 ) | [ZY Player TV](https://github.com/cuiocean/ZY-Player-TV)    |
| 🌐 浏览器 ( Web )                      | [ZY Player Web](https://github.com/Hunlongyu/ZY-Player-Web) |

### 🎨 截图

|                           影视 (首页)                           |                             影视 (搜索)                             |
| :-------------------------------------------------------------: | :-----------------------------------------------------------------: |
| ![影视.png](https://s2.loli.net/2023/02/27/fQb9HhwlKtLTYRj.png) | ![影视搜素.png](https://s2.loli.net/2023/02/27/Feb1wdrLxNqi9Ju.png) |
|                           影视 (播放)                           |                             影视 (介绍)                             |
| ![影视播放](https://s2.loli.net/2023/02/27/k4omTLsg178tfyV.png) |   ![影视详情](https://s2.loli.net/2023/02/27/gsIiHVk32WNeFml.png)   |
|                          影视 (热榜）                           |                             直播(首页)                              |
| ![热榜.png](https://s2.loli.net/2023/02/27/q1lbRejL9pYKOZF.png) |   ![直播首页](https://s2.loli.net/2023/02/27/JztFEq8xKHSsGXZ.png)   |
|                           直播(播放)                            |                                解析                                 |
| ![直播播放](https://s2.loli.net/2023/02/28/SVzaNq21yhTZFQH.png) |     ![解析](https://s2.loli.net/2023/02/28/Djtb5ArKwuMgUlx.png)     |
|                            历史记录                             |                                在追                                 |
| ![历史.png](https://s2.loli.net/2023/02/27/CdR7Wo2nK6ZjOyI.png) |     ![在追](https://s2.loli.net/2023/02/27/SH53tleP9o8mX4Q.png)     |
