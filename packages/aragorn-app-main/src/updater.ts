import axios from 'axios';
import { app, Notification, shell } from 'electron';
import { lt } from 'semver';
import { Setting } from './setting';
import { Ipc } from './ipc';

export interface UpdaterChannelData {
  message: string;
  description?: string;
  url?: string;
}

const appVersion = app.getVersion();

const GithubReleaseApi = `https://api.github.com/repos/njzydark/Aragorn/releases?per_page=3`;

export class Updater {
  private static instance: Updater;

  static getInstance() {
    if (!Updater.instance) {
      Updater.instance = new Updater();
    }
    return Updater.instance;
  }

  setting: Setting;

  protected constructor() {
    this.setting = Setting.getInstance();
  }

  checkUpdate(manul = false, useSystemNotification = false) {
    console.log('check update');
    if (manul) {
      this.sendMessage(
        {
          message: '正在检查更新...'
        },
        useSystemNotification
      );
    }
    this.checkUpdateFromGithub(manul, useSystemNotification);
  }

  protected async checkUpdateFromGithub(manul: boolean, useSystemNotification: boolean) {
    try {
      const { useBetaVersion } = this.setting.get();
      const res = await axios.get<{ prerelease: boolean; draft: boolean; tag_name: string; html_url: string }[]>(
        GithubReleaseApi
      );
      if (res.status === 200) {
        const data = res.data;
        const latest = data.find(item => item.prerelease === false && item.draft === false);
        const latestBeta = data.find(item => item.prerelease === true && item.draft === false);
        let updateInfo: ({ tag_name: string; html_url: string } & typeof latest) | null = null;
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
          this.sendMessage(
            {
              message: `有新版本可供更新`,
              description: `${updateInfo.tag_name}`,
              url: updateInfo.html_url
            },
            useSystemNotification
          );
        } else {
          manul &&
            this.sendMessage(
              {
                message: '当前已是最新版本'
              },
              useSystemNotification
            );
        }
      } else {
        manul &&
          this.sendMessage(
            {
              message: `网络请求失败，请稍后重试`
            },
            useSystemNotification
          );
      }
    } catch (err) {
      console.error(`check update error: ${err.message}`);
      manul &&
        this.sendMessage(
          {
            message: `检查更新失败`,
            description: err.message
          },
          useSystemNotification
        );
    }
  }

  protected sendMessage(channelData: UpdaterChannelData, useSystemNotification: boolean) {
    if (useSystemNotification) {
      const notification = new Notification({ title: channelData.message, body: channelData.description || '' });
      if (channelData.url) {
        notification.on('click', () => {
          shell.openExternal(channelData.url as string);
        });
      }
      notification.show();
    } else {
      Ipc.sendMessage('app-updater-message', channelData);
    }
  }
}
