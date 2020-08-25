import { Ipc } from './ipc';
import axios from 'axios';
import { app } from 'electron';
import { lt } from 'semver';
import { Setting } from './setting';

const appVersion = app.getVersion();

const setting = Setting.getInstance();

const GithubReleaseApi = `https://api.github.com/repos/njzydark/Aragorn/releases?per_page=3`;

export interface UpdaterChannelData {
  message: string;
  description?: string;
  url?: string;
}

export class Updater {
  private static instance: Updater;

  static getInstance() {
    if (!Updater.instance) {
      Updater.instance = new Updater();
    }
    return Updater.instance;
  }

  checkUpdate(manul = false) {
    if (manul) {
      this.sendMessage({
        message: '正在检查更新...'
      });
    }
    this.checkUpdateFromGithub(manul);
  }

  protected async checkUpdateFromGithub(manul) {
    try {
      const { useBetaVersion } = setting.get();
      const res = await axios.get(GithubReleaseApi);
      if (res.status === 200 && res?.data?.length > 0) {
        const data = res.data;
        const latest = data.find(item => item.prerelease === false && item.draft === false);
        const latestBeta = data.find(item => item.prerelease === true && item.draft === false);
        let updateInfo: { tag_name: string; html_url: string } | null = null;
        if (useBetaVersion) {
          if (latest && lt(appVersion, latest.tag_name)) {
            updateInfo = latest;
          } else if (latestBeta && lt(appVersion, latestBeta.tag_name)) {
            updateInfo = latestBeta;
          }
        } else {
          if (latest && lt(appVersion, latest.tag_name)) {
            updateInfo = latest;
          }
        }
        if (updateInfo) {
          this.sendMessage({
            message: `有新版本可供更新`,
            description: `${updateInfo.tag_name}`,
            url: updateInfo.html_url
          });
        } else {
          manul &&
            this.sendMessage({
              message: '当前已是最新版本'
            });
        }
      } else {
        manul &&
          this.sendMessage({
            message: `网络请求失败，请稍后重试`
          });
      }
    } catch (err) {
      manul &&
        this.sendMessage({
          message: `检查更新失败`,
          description: err.message
        });
    }
  }

  protected sendMessage(channelData: UpdaterChannelData) {
    Ipc.sendMessage('app-updater-message', channelData);
  }
}
