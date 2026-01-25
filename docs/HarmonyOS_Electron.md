# HarmonyOS Electron 快速上手指南

本指南将帮助您在 30 分钟内快速上手 HarmonyOS Electron 开发。

## 📋 准备清单

### 开发环境

- [ ] DevEco Studio 4.0+
- [ ] HarmonyOS SDK API Level 10+
- [ ] Node.js 16.x+
- [ ] 鸿蒙设备或模拟器

### 必需文件

- [ ] Electron 应用源码或编译产物
- [ ] 开发者证书（可选，用于签名）

## 🚀 5 分钟快速开始

### 步骤 1: 克隆项目

```bash
git clone https://github.com/ohosvscode/ohos_electron_hap.git
cd ohos_electron_hap
```

### 步骤 2: 添加 Electron 应用

将您的 Electron 应用代码放入：

```
web_engine/src/main/resources/resfile/resources/app/
```

### 步骤 3: 构建运行

1. 用 DevEco Studio 打开项目
2. 点击 **Build** → **Build Hap(s)**
3. 点击运行按钮安装到设备

🎉 **恭喜！您的第一个鸿蒙 Electron 应用已经运行起来了！**

## 📖 详细配置教程

### 自定义应用信息

#### 修改应用名称

编辑 `electron/src/main/resources/zh_CN/element/string.json`：

```json
{
  "string": [
    {
      "name": "EntryAbility_label",
      "value": "我的鸿蒙应用"
    }
  ]
}
```

#### 替换应用图标

1. 准备图标文件（建议 512x512 PNG）
2. 替换 `AppScope/resources/base/media/app_icon.png`
3. 重新构建应用

#### 设置启动窗口

编辑 `electron/src/main/module.json5`，在 abilities 中添加：

```json
"metadata": [
  {
    "name": "ohos.ability.window.width",
    "value": "1200"
  },
  {
    "name": "ohos.ability.window.height",
    "value": "800"
  },
  {
    "name": "ohos.ability.window.left",
    "value": "center"
  },
  {
    "name": "ohos.ability.window.top",
    "value": "center"
  }
]
```

### 权限配置

#### 基础权限（自动获得）

这些权限会自动获得，无需特殊申请：

- 网络访问
- 获取网络信息
- 后台运行
- 读取剪贴板

#### 需要申请的权限

编辑 `web_engine/src/main/module.json5`，在 `requestPermissions` 中添加：

```json
{
  "name": "ohos.permission.CAMERA",
  "reason": "$string:camera_reason",
  "usedScene": {
    "abilities": ["EntryAbility"],
    "when": "inuse"
  }
}
```

常用权限列表：

- `ohos.permission.CAMERA` - 相机
- `ohos.permission.MICROPHONE` - 麦克风
- `ohos.permission.LOCATION` - 位置
- `ohos.permission.READ_WRITE_DOWNLOAD_DIRECTORY` - 下载目录

### 应用签名

#### 申请开发者证书

1. 访问 [华为开发者联盟](https://developer.huawei.com/)
2. 注册开发者账号
3. 申请 HarmonyOS 应用签名证书

#### 配置签名

1. 在 DevEco Studio 中选择 **File** → **Project Structure**
2. 选择 **Signing Configs**
3. 配置证书文件和密码
4. 重新构建生成已签名 HAP

## 💡 实用示例

### 示例 1: 创建悬浮窗

```javascript
const { BrowserWindow } = require('electron');

function createFloatWindow() {
  const floatWindow = new BrowserWindow({
    windowInfo: {
      type: 'floatWindow',
    },
    width: 400,
    height: 300,
    transparent: true,
    opacity: 0.9,
    frame: false,
    alwaysOnTop: true,
  });

  floatWindow.loadURL('https://www.example.com');
  return floatWindow;
}
```

### 示例 2: 请求系统权限

```javascript
const { systemPreferences } = require('electron');

async function requestPermissions() {
  // 请求相机权限
  const cameraGranted = await systemPreferences.requestSystemPermission('camera');
  console.log('相机权限:', cameraGranted ? '已授权' : '被拒绝');

  // 请求麦克风权限
  const micGranted = await systemPreferences.requestSystemPermission('microphone');
  console.log('麦克风权限:', micGranted ? '已授权' : '被拒绝');

  // 请求目录访问权限
  const dirGranted = await systemPreferences.requestDirectoryPermission(null);
  console.log('目录权限:', dirGranted ? '已授权' : '被拒绝');
}

// 在应用启动时调用
app.whenReady().then(requestPermissions);
```

### 示例 3: 检查权限状态

```javascript
const { systemPreferences } = require('electron');

function checkPermissionStatus() {
  const cameraStatus = systemPreferences.getMediaAccessStatus('camera');
  const micStatus = systemPreferences.getMediaAccessStatus('microphone');

  console.log('权限状态:', {
    camera: cameraStatus, // 'granted', 'denied', 'not-determined'
    microphone: micStatus,
  });
}
```

## 🛠️ 调试技巧

### 渲染进程调试

```javascript
// 在主进程中
const { BrowserWindow } = require('electron');

const win = new BrowserWindow({
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
  },
});

// 打开开发者工具
win.webContents.openDevTools();
```

### 主进程调试

#### 1. 启用调试模式

编辑 `web_engine/src/main/ets/components/WebWindow.ets`：

```typescript
// 添加调试参数
let inspect = '--inspect=9229';
let vec_args = [
  '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  resDir,
  inspect, // 添加这行
];
```

#### 2. 配置端口转发

```bash
hdc fport tcp:9229 tcp:9229
```

#### 3. Chrome 调试

1. 在 Chrome 中访问：`chrome://inspect`
2. 点击 "Configure..." 添加 `localhost:9229`
3. 启动应用后点击 "inspect" 开始调试

## 🔧 常见问题解决

### 问题 1: 构建失败 "找不到 SO 库"

**解决方案**:

1. 检查 `electron/libs/arm64-v8a/` 目录是否存在
2. 确认 5 个 SO 文件都已正确放置
3. 检查文件权限

### 问题 2: 应用启动崩溃

**解决方案**:

1. 检查 Electron 应用代码是否放在正确位置
2. 确认应用代码已正确编译（如 TypeScript → JavaScript）
3. 查看 DevEco Studio 的日志输出

### 问题 3: 权限被拒绝

**解决方案**:

1. 检查 `module.json5` 中的权限声明
2. 确认已正确调用权限请求 API
3. 对于 ACL 权限，确认已申请相应证书

### 问题 4: 三方库不兼容

**解决方案**:

```javascript
// 检查平台
if (process.platform === 'ohos') {
  // 鸿蒙平台特殊处理
  console.log('运行在 HarmonyOS 上');
}

// 替换不兼容的库
const fs = process.platform === 'ohos' ? require('./ohos-fs-polyfill') : require('fs');
```

## 📚 进阶学习

### 了解鸿蒙文件系统

```javascript
// 应用数据目录
const userDataPath = '/data/storage/el2/base/files';
const tempPath = '/data/storage/el2/base/temp';
const cachePath = '/data/storage/el2/base/cache';

// 使用 Electron API
const { app } = require('electron');
console.log('用户数据目录:', app.getPath('userData'));
console.log('临时目录:', app.getPath('temp'));
```

### 性能优化建议

1. **预加载重要资源**: 将常用文件放在应用包内
2. **合理使用权限**: 只申请必需的权限
3. **优化启动时间**: 减少首屏加载资源
4. **内存管理**: 及时释放不用的窗口和资源

### 发布准备

1. **测试各种权限场景**
2. **验证多窗口功能**
3. **检查应用图标和名称**
4. **准备应用商店描述**

## 🎯 下一步

- 💬 加入开发者社区交流

---

**需要帮助？**

- 📖 查看完整文档
- 🐛 提交 Issue
- 💬 联系维护团队

祝您开发愉快！🎉
