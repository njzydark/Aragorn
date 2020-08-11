import { autoUpdater, UpdateInfo } from 'electron-updater';
import { Ipc } from './ipc';

export interface ProgressInfo {
  total: number;
  delta: number;
  transferred: number;
  percent: number;
  bytesPerSecond: number;
}

export interface UpdaterChannelData {
  message: string;
  description?: string;
  percent?: number;
}

export class Updater {
  private static instance: Updater;

  static getInstance() {
    if (!Updater.instance) {
      Updater.instance = new Updater();
    }
    return Updater.instance;
  }

  constructor() {
    autoUpdater.autoDownload = false;
    this.initUpdaterHandle();
  }

  checkUpdate() {
    autoUpdater.checkForUpdates();
  }

  protected sendMessage(channelData: UpdaterChannelData) {
    Ipc.sendMessage('app-updater-message', channelData);
  }

  protected initUpdaterHandle() {
    autoUpdater.on('checking-for-update', () => {
      this.sendMessage({
        message: '正在检查更新...'
      });
    });
    autoUpdater.on('update-available', (info: UpdateInfo) => {
      const url = autoUpdater.getFeedURL();
      this.sendMessage({
        message: `有新版本可供更新`,
        description: `${info.releaseName}-${info.version}-${info.releaseDate}-${url}`
      });
    });
    autoUpdater.on('update-not-available', (info: UpdateInfo) => {
      this.sendMessage({
        message: `当前版本已是最新版本`,
        description: info.version
      });
    });
    autoUpdater.on('error', (err: Error) => {
      this.sendMessage({
        message: `更新出现错误`,
        description: err.message
      });
    });
    autoUpdater.on('download-progress', (progress: ProgressInfo) => {
      this.sendMessage({
        message: `正在下载中`,
        percent: progress.percent
      });
    });
    autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
      this.sendMessage({
        message: `新版本-${info.version}下载完成`,
        description: '3s后自动重启更新'
      });
      setTimeout(function () {
        autoUpdater.quitAndInstall();
      }, 3000);
    });
  }
}
