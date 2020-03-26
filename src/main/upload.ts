import { Notification, BrowserWindow, clipboard } from 'electron';
import { createReadStream } from 'fs';
import axios, { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import { imageSize } from 'image-size';
import { Setting } from './setting';
import { History } from './history';
import { IBasic, IApi } from 'types';

/**
 * 处理上传事件
 * @param win
 * @param setting
 * @param history
 * @param files
 */
export async function handleUpload(win: BrowserWindow, setting: Setting, history: History, files: string[]) {
  console.log(files);
  const { basic, apiList } = setting;
  const api = apiList.find(api => api.name === basic.defaultApiName);
  if (api) {
    const file = files[0];
    const formData = new FormData();
    formData.append(api.fileFieldName, createReadStream(file));
    formData.getLength((err, length) => {
      if (err) {
        console.log('content-length 获取失败');
      } else {
        upload(win, history, basic, api, formData, length, file);
      }
    });
  } else {
    const message = apiList.length > 0 ? '请配置默认上传接口' : '请添加图片上传接口';
    console.log(message);
    const notification = new Notification({ title: '图片上传失败', body: message });
    notification.show();
  }
}

async function upload(
  win: BrowserWindow,
  history: History,
  basic: IBasic,
  api: IApi,
  formData: FormData,
  length: number,
  file: string
) {
  try {
    const requestOpetion: AxiosRequestConfig = {
      url: api.url,
      method: api.method,
      headers: {
        ...formData.getHeaders(),
        'Content-Length': length
      },
      params: api.requestParams ? JSON.parse(api.requestParams) : {},
      data: api.contentType === 'multipart/form-data' ? formData : api.requestBody
    };
    // 发起请求
    const { data: res } = await axios(requestOpetion);
    let imageUrl = res?.data?.[api.responseUrlFieldName];
    if (imageUrl) {
      console.log('上传成功');
      // 获取图片尺寸
      const dimensions = imageSize(file);
      const channelData = {
        src: imageUrl,
        width: dimensions.width,
        height: dimensions.height,
        date: new Date().getTime(),
        path: file
      };
      // 将图片信息添加到历史记录中
      const images = history.add(channelData);
      if (!win.isDestroyed()) {
        win.webContents.send('images-get-replay', images);
      }
      // 根据urlType转换图片链接格式
      switch (basic.urlType) {
        case 'URL':
          break;
        case 'HTML':
          imageUrl = `<img src="${imageUrl}" />`;
          break;
        case 'Markdown':
          imageUrl = `![${imageUrl}](${imageUrl})`;
          break;
        default:
          return imageUrl;
      }
      if (basic.autoCopy) {
        let preClipBoardText = '';
        if (basic.autoRecover) {
          preClipBoardText = clipboard.readText();
        }
        // 开启自动复制
        clipboard.writeText(imageUrl);
        const notification = new Notification({
          title: '图片上传成功',
          body: '链接已自动复制到粘贴板',
          silent: !basic.sound
        });
        basic.showNotifaction && notification.show();
        basic.autoRecover &&
          setTimeout(() => {
            clipboard.writeText(preClipBoardText);
            const notification = new Notification({
              title: '粘贴板已恢复',
              body: '已自动恢复上次粘贴板中的内容',
              silent: !basic.sound
            });
            notification.show();
          }, 5000);
      } else {
        const notification = new Notification({ title: '图片上传成功', body: imageUrl, silent: !basic.sound });
        basic.showNotifaction && notification.show();
      }
    } else {
      console.log('图片请求失败');
      console.dir(requestOpetion);
      console.dir(res);
      const notification = new Notification({ title: '图片地址获取失败', body: JSON.stringify(res) });
      notification.show();
    }
  } catch (err) {
    console.log('上传失败', err);
    const notification = new Notification({ title: '图片上传失败', body: err.message });
    notification.show();
  }
}
