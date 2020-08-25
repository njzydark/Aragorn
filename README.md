# Aragorn (WIP)

一款基于 `Electron + React + TS` 开发的文件上传软件，主要是利用相关厂商的对象存储 SDK 来进行文件上传和管理

![aragorn](assets/aragorn.png)

## 上传器 - Uploader

为了软件的扩展性，对象存储 SDK 的配置项是通过一个名为 `上传器` 的概念向用户提供的，不同厂商的 SDK 都有相对应的上传器供用户使用

软件目前支持以下厂商的对象存储 SDK

- 阿里云
- 七牛云
- 又拍云
- UCloud

## 开发

项目依赖安装

```bash
npm i
npm run setup
```

启动 App

```bash
npm run app:dev
npm run app:start
```

PS: 项目已经配置好了 `task.json` 和 `launch.json` ，可以直接在 vscode 中执行 task ，然后以 debug 模式启动

## 打包

```bash
npm run app:build
npm run app:dist
```

## TODO

- [x] 托盘拖拽上传
- [x] 手动选择上传
- [x] 自定义上传 API
- [ ] 使用对象存储 SDK 进行上传
  - [x] 七牛云
  - [x] 又拍云
  - [x] UCloud
  - [x] 阿里云
  - [ ] 腾讯云
- [x] 历史记录
- [x] 基本设置
  - [x] 通知开关
  - [x] 声音开关
  - [x] 自动复制
  - [x] URL 格式转换
  - [x] 自动更新
- [ ] 上传进度
- [ ] 利用对象存储 SDK 进行文件管理
  - [x] 阿里云
  - [x] 又拍云
  - [ ] 七牛云
  - [ ] 腾讯云
