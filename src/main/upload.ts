import { IApi, ISdk, UserSdk } from 'types';
import { Notification, BrowserWindow, clipboard } from 'electron';
import { createReadStream } from 'fs';
import axios, { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import { imageSize } from 'image-size';
import { Setting } from './setting';
import { History } from './history';

const setting = Setting.getInstance();
const history = History.getInstance();

export class Upload {
  /** 文件路径列表 */
  private files: string[];
  static win: BrowserWindow;

  constructor(files: string[]) {
    this.files = files;
  }

  toUpload() {
    const {
      basic: { defaultUploaderName },
      userApiList,
      userSdkList
    } = setting;
    const uploaderList = [...userApiList, ...userSdkList];
    const uploader = uploaderList.find(uploader => uploader.name === defaultUploaderName);
    if (!uploader) {
      const message = uploaderList.length > 0 ? '请配置默认上传方式' : '请添加上传方式';
      const notification = new Notification({ title: '上传操作异常', body: message });
      notification.show();
      return;
    }
    if (uploader.type === 'custom') {
      this.handleUploadByApi(uploader);
    }
    if (uploader.type === 'sdk') {
      this.handleUploadBySdk(uploader);
    }
  }

  protected async handleUploadBySdk(uploader: UserSdk) {
    try {
      const sdk = setting.sdks.find(item => item.sdkName === uploader.sdkName) as ISdk;
      sdk.configurationList = uploader.configurationList;
      const res = await sdk.upload(this.files);
      if (res.success) {
        this.handleUploadSuccess(res.info?.url || '', this.files[0]);
      } else {
        const notification = new Notification({
          title: 'SDK方式上传失败',
          body: res.err?.message || '错误信息未捕获'
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
            this.handleUploadSuccess(imageUrl, this.files[0]);
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

  protected handleUploadSuccess(url: string, file: string) {
    console.log('上传成功');
    // 获取图片尺寸
    const dimensions = imageSize(file);
    const channelData = {
      src: url,
      width: dimensions.width,
      height: dimensions.height,
      date: new Date().getTime(),
      path: file
    };
    // 将图片信息添加到历史记录中
    const images = history.add(channelData);
    if (!Upload.win.isDestroyed()) {
      Upload.win.webContents.send('images-get-replay', images);
    }
    // 根据urlType转换图片链接格式
    switch (setting.basic.urlType) {
      case 'URL':
        break;
      case 'HTML':
        url = `<img src="${url}" />`;
        break;
      case 'Markdown':
        url = `![${url}](${url})`;
        break;
      default:
        return url;
    }
    if (setting.basic.autoCopy) {
      let preClipBoardText = '';
      if (setting.basic.autoRecover) {
        preClipBoardText = clipboard.readText();
      }
      // 开启自动复制
      clipboard.writeText(url);
      const notification = new Notification({
        title: '上传成功',
        body: '链接已自动复制到粘贴板',
        silent: !setting.basic.sound
      });
      setting.basic.showNotifaction && notification.show();
      setting.basic.autoRecover &&
        setTimeout(() => {
          clipboard.writeText(preClipBoardText);
          const notification = new Notification({
            title: '粘贴板已恢复',
            body: '已自动恢复上次粘贴板中的内容',
            silent: !setting.basic.sound
          });
          notification.show();
        }, 5000);
    } else {
      const notification = new Notification({
        title: '上传成功',
        body: url,
        silent: !setting.basic.sound
      });
      setting.basic.showNotifaction && notification.show();
    }
  }
}
