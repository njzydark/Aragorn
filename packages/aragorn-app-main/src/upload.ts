import { Notification, clipboard } from 'electron';
import mime from 'mime-types';
import { Ipc } from './ipc';
import { Setting } from './setting';
import { History } from './history';
import { UploaderProfileManager } from './uploaderProfileManager';
import { AragornCore } from 'aragorn-core';
import { UploadResponseData } from 'aragorn-types';

/** 上传成功之后的文件信息 */
export type UploadedFileInfo = UploadResponseData & {
  /** 文件类型 MimeType */
  type: string;
  /** 上传器配置 Id */
  uploaderProfileId: string;
  /** 文件路径 */
  path: string;
  /** 文件大小 */
  size?: number;
  /** 上传时间 */
  date: number;
};

const setting = Setting.getInstance();
const history = History.getInstance();
const uploaderProfileManager = UploaderProfileManager.getInstance();
const core = new AragornCore();

export class Upload {
  /** 文件路径列表 */
  private files: string[];

  constructor(files: string[]) {
    this.files = files;
  }

  async toUpload() {
    try {
      const {
        configuration: { defaultUploaderProfileId }
      } = setting;
      const uploaderProfiles = uploaderProfileManager.getAll();
      const uploaderProfile = uploaderProfiles.find(uploaderProfile => uploaderProfile.id === defaultUploaderProfileId);
      if (!uploaderProfile) {
        const message = uploaderProfiles.length > 0 ? '请配置默认的上传器' : '请添加上传器配置';
        const notification = new Notification({ title: '上传操作异常', body: message });
        notification.show();
        return;
      }
      const uploader = core.getUploaderByName(uploaderProfile.uploaderName);
      if (!uploader) {
        const message = `没有找到${uploaderProfile.uploaderName}上传器`;
        const notification = new Notification({ title: '上传操作异常', body: message });
        notification.show();
        return;
      }
      uploader.changeOptions(uploaderProfile.uploaderOptions);
      const res = await uploader.upload(this.files);
      if (res.success) {
        this.handleUploadSuccess(res.data as UploadResponseData, uploaderProfile.id);
      } else {
        const notification = new Notification({
          title: '上传失败',
          body: res.desc || '错误信息未捕获'
        });
        notification.show();
      }
    } catch (err) {
      const notification = new Notification({ title: '上传操作异常', body: err.message });
      notification.show();
    }
  }

  protected handleUploadSuccess(fileInfo: UploadResponseData, uploaderProfileId: string) {
    console.log('上传成功');
    const filePath = this.files[0];
    const uploadedFileInfo: UploadedFileInfo = {
      ...fileInfo,
      type: mime.lookup(filePath) || '-',
      uploaderProfileId,
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
