import { IApi, ISdk, UserSdk, UploadedFileInfo, UploadResponseData } from 'types';
import { Notification, clipboard } from 'electron';
import { createReadStream } from 'fs';
import axios, { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
import { Ipc } from './ipc';
import { Setting } from './setting';
import { History } from './history';
import { Api } from './api';
import { Sdk } from './sdk';

const setting = Setting.getInstance();
const history = History.getInstance();
const api = Api.getInstance();
const sdk = Sdk.getInstance();

export class Upload {
  /** 文件路径列表 */
  private files: string[];

  constructor(files: string[]) {
    this.files = files;
  }

  toUpload() {
    const {
      configuration: { defaultUploader }
    } = setting;
    const { userApiList } = api;
    const { userSdkList, sdks } = sdk;
    const uploaderList = [...userApiList, ...userSdkList];
    const uploader = uploaderList.find(uploader => uploader.uuid === defaultUploader);
    if (!uploader) {
      const message = uploaderList.length > 0 ? '请配置默认上传方式' : '请添加上传方式';
      const notification = new Notification({ title: '上传操作异常', body: message });
      notification.show();
      return;
    }
    if (uploader.type === 'api') {
      this.handleUploadByApi(uploader);
    }
    if (uploader.type === 'sdk') {
      this.handleUploadBySdk(uploader, sdks);
    }
  }

  protected async handleUploadBySdk(uploader: UserSdk, sdks: ISdk[]) {
    try {
      const sdk = sdks.find(item => item.sdkName === uploader.sdkName) as ISdk;
      sdk.configurationList = uploader.configurationList;
      const res = await sdk.upload(this.files);
      if (res.success) {
        this.handleUploadSuccess(res.data as UploadResponseData, uploader);
      } else {
        const notification = new Notification({
          title: 'SDK方式上传失败',
          body: res.desc || '错误信息未捕获'
        });
        notification.show();
      }
    } catch (err) {
      console.log(err);
    }
  }

  protected handleUploadByApi(uploader: IApi) {
    const file = this.files[0];
    const formData = new FormData();
    formData.append(uploader.fileFieldName, createReadStream(file));
    formData.getLength(async (err, length) => {
      if (err) {
        console.log('content-length 获取失败');
      } else {
        try {
          const requestOpetion: AxiosRequestConfig = {
            url: uploader.url,
            method: uploader.method,
            headers: {
              ...formData.getHeaders(),
              'Content-Length': length
            },
            params: uploader.requestParams ? JSON.parse(uploader.requestParams) : {},
            data: uploader.contentType === 'multipart/form-data' ? formData : uploader.requestBody
          };
          // 发起请求
          const { data: res } = await axios(requestOpetion);
          let imageUrl = res?.data?.[uploader.responseUrlFieldName];
          if (imageUrl) {
            const fileInfo: UploadResponseData = {
              name: uuidv4(),
              url: imageUrl
            };
            this.handleUploadSuccess(fileInfo, uploader);
          } else {
            console.log('请求失败');
            console.dir(requestOpetion);
            console.dir(res);
            const notification = new Notification({ title: '地址获取失败', body: JSON.stringify(res) });
            notification.show();
          }
        } catch (err) {
          console.log('API方式上传失败', err);
          const notification = new Notification({ title: 'API方式上传失败', body: err.message });
          notification.show();
        }
      }
    });
  }

  protected handleUploadSuccess(fileInfo: UploadResponseData, uploader: UserSdk | IApi) {
    console.log('上传成功');
    const filePath = this.files[0];
    const uploadedFileInfo: UploadedFileInfo = {
      ...fileInfo,
      type: mime.lookup(filePath) || '-',
      uploader,
      path: filePath,
      date: new Date().getTime()
    };
    // 将图片信息添加到历史记录中
    const uploadedFiles = history.add(uploadedFileInfo);
    if (!Ipc.win.isDestroyed()) {
      Ipc.win.webContents.send('uploaded-files-get-reply', uploadedFiles);
    }
    // 根据urlType转换图片链接格式
    let clipboardUrl = fileInfo.url;
    switch (setting.configuration.urlType) {
      case 'URL':
        break;
      case 'HTML':
        clipboardUrl = `<img src="${fileInfo.url}" />`;
        break;
      case 'Markdown':
        clipboardUrl = `![${fileInfo.url}](${fileInfo.url})`;
        break;
      default:
        return fileInfo.url;
    }
    if (setting.configuration.autoCopy) {
      let preClipBoardText = '';
      if (setting.configuration.autoRecover) {
        preClipBoardText = clipboard.readText();
      }
      // 开启自动复制
      clipboard.writeText(clipboardUrl || '');
      const notification = new Notification({
        title: '上传成功',
        body: '链接已自动复制到粘贴板',
        silent: !setting.configuration.sound
      });
      setting.configuration.showNotifaction && notification.show();
      setting.configuration.autoRecover &&
        setTimeout(() => {
          clipboard.writeText(preClipBoardText);
          const notification = new Notification({
            title: '粘贴板已恢复',
            body: '已自动恢复上次粘贴板中的内容',
            silent: !setting.configuration.sound
          });
          notification.show();
        }, 5000);
    } else {
      const notification = new Notification({
        title: '上传成功',
        body: clipboardUrl || '',
        silent: !setting.configuration.sound
      });
      setting.configuration.showNotifaction && notification.show();
    }
  }
}
