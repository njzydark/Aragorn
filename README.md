# Aragorn

[![GitHub release (latest by date including pre-releases](https://img.shields.io/github/v/release/njzydark/Aragorn?include_prereleases)](https://github.com/njzydark/Aragorn/releases/latest)
[![Build](https://github.com/njzydark/Aragorn/workflows/Build/release/badge.svg)](https://github.com/njzydark/Aragorn/actions?query=workflow%3ABuild%2Frelease)
[![GitHub](https://img.shields.io/github/license/njzydark/Aragorn)](https://github.com/njzydark/Aragorn/blob/master/LICENSE)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=flat-square)](https://lerna.js.org/)

一款基于 `Electron + React + TS` 开发的对象存储管理工具，同时也可作为图床上传工具使用

**PS:** 功能实现主要依靠相关厂商的对象存储 SDK，但是也可自行扩展，只要按规范实现软件的[上传器接口](./packages/aragorn-types/src/uploader.ts)即可

![aragorn](assets/aragorn.png)

## 特性

- 同一上传器支持多个配置
- 文件上传失败可以在控制台重新上传
- 支持利用魔法变量自定义文件命名格式
- 提供 CLI 和上传 API 接口，方便第三方软件调用，例如：Typora、MWeb
- CLI 支持模式自动切换，未开启软件的情况下也可以正常使用
- 支持在 Finder 中通过鼠标右键菜单上传
- 通过内置的自定义上传器可以自定义上传 API
- 支持基础的文件管理功能：浏览、上传、下载、删除、创建目录
- 丰富的设置项：代理、自动复制、格式转换等

## 对象存储及相关图床支持情况

|        | 上传功能      | 文件管理功能 |
| ------ | ------------- | ------------ |
| 七牛云 | ✅            | ✅           |
| 又拍云 | ✅            | ✅           |
| 阿里云 | ✅            | ✅           |
| 腾讯云 | ✅            | ✅           |
| UCloud | ✅            |              |
| Github | ✅            | ✅           |
| SM.MS  | ✅ 自定义实现 |              |

**PS** 软件还在开发中，后续会支持更多对象存储厂商及图床

## WebServer

可在设置中开启，默认关闭

- 地址: <http://127.0.0.1:7777>
- POST 请求格式无论是 `form-data` 还是 `json`，文件字段名都为 `files`

### 示例

form-data 请求

```bash
curl http://127.0.0.1:7777 -X POST -H "Content-Type: multipart/form-data" -F "files=@文件绝对路径"
```

json 请求

```bash
curl http://127.0.0.1:7777 -X POST -H "Content-Type: application/json" -d '{"files": ["文件绝对路径"]}'
```

响应

```json
{
  "url": "urls中的第一个",
  "urls": ["文件地址"]
}
```

## CLI

CLI 可在设置中安装，安装后可通过 `aragorn` 或 `/usr/local/bin/aragorn` 使用

```bash
     _                                        ____ _ _
    / \   _ __ __ _  __ _  ___  _ __ _ __    / ___| (_)
   / _ \ | '__/ _` |/ _` |/ _ \| '__| '_ \  | |   | | |
  / ___ \| | | (_| | (_| | (_) | |  | | | | | |___| | |
 /_/   \_\_|  \__,_|\__, |\___/|_|  |_| |_|  \____|_|_|
                    |___/

A cli for aragorn to upload files

Usage: aragorn upload [options] <imagesPath...>

upload files

Options:
  -m,--mode <mode>                             upload mode, cli or app (default: "cli")
  -p,--port <port>                             app webserver port (default: "7777")
  --uploaderProfileName [uploaderProfileName]  uploader profile name
  --uploaderProfileId [uploaderProfileId]      uploader profile id
  -h, --help                                   display help for command
```

如果配合 `Typora` 使用，在 `Typora` 的图像设置中配置以下自定义指令即可：

```bash
/usr/local/bin/aragorn upload
```

**PS** 如果开启 WebServer ，那么 CLI 也会通过 `WebServer` 提供的接口进行上传，未开启状态 CLI 会通过自身内置的方式进行上传，所以即使软件未开启也可以正常使用

## 开发

### 克隆代码

```bash
git clone https://github.com/njzydark/Aragorn.git
```

### 安装依赖

```bash
npm i && npm run setup
```

#### 注意

1. 项目是使用 [lerna](https://lerna.js.org/) 进行管理的，根目录的 `package.json` 只是公共开发依赖，不包含项目所有依赖

   `npm i` 只是把公共开发依赖装上

   `npm run setup` 会把所有 `packages` 里的依赖全部装上

2. 由于众所周知的网络原因，依赖可能无法正常安装，尤其是 `Electron`，这里推荐使用淘宝镜像源来解决此问题，在项目根目录创建 `.npmrc` 文件，配置以下内容：

   ```txt
   registry=https://registry.npm.taobao.org
   ELECTRON_MIRROR=https://npm.taobao.org/mirrors/electron/
   ELECTRON_BUILDER_BINARIES_MIRROR=http://npm.taobao.org/mirrors/electron-builder-binaries/
   ```

### 开发模式

```bash
npm run app:dev
npm run app:start
```

PS: 项目已经配置好了 `task.json` 和 `launch.json` ，可以直接在 vscode 中执行 task ，然后以 debug 模式启动

### 打包

```bash
npm run app:build
npm run app:dist
```

## TODO

- [x] 托盘拖拽上传
- [x] 手动选择上传
- [x] 文件名自定义
- [x] 使用对象存储 SDK 或相关 API 进行上传
  - [x] 七牛云
  - [x] 又拍云
  - [x] UCloud
  - [x] 阿里云
  - [x] 腾讯云
  - [x] Github
- [x] 利用对象存储 SDK 或相关 API 进行文件管理
  - [x] 阿里云
  - [x] 又拍云
  - [x] 七牛云
  - [x] 腾讯云
  - [x] Github
- [x] 自定义上传 API
- [x] 历史记录
- [x] 基本设置
  - [x] 通知开关
  - [x] 声音开关
  - [x] 自动复制
  - [x] URL 格式转换
  - [x] 自动更新
  - [x] http 代理
- [ ] 上传进度

## License

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fnjzydark%2FAragorn.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fnjzydark%2FAragorn?ref=badge_large)
