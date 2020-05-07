# Aragorn (WIP)

一款基于 `Electron+React+TS` 开发的上传工具，通过自定义 Api 上传参数或者使用对象存储 SDK 来进行文件上传

## DEV

```bash
npm run renderer:dev
npm run main:dev
npm run start
```

PS: 项目已经配置好了`task.json`和`launch.json`，可以直接在vscode中执行task，然后以debug模式启动

## TODO

- [x] 托盘拖拽上传
- [x] 手动选择上传
- [x] 自定义上传API
- [ ] 使用对象存储SDK进行上传
  - [x] 七牛云
  - [x] 又拍云
  - [x] UCloud
  - [ ] 阿里云
  - [ ] 腾讯云
- [x] 历史记录
- [x] 基本设置
  - [x] 通知开关
  - [x] 声音开关
  - [x] 自动复制
  - [x] URL格式转换
  - [ ] 自动更新
- [ ] 上传进度
- [ ] 利用对象存储SDK进行文件管理
