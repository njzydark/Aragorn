import { app, globalShortcut } from 'electron';
import path from 'path';
import fs from 'fs-extra';
import { exec } from 'child_process';
import { settingStore } from './store';
import { UploaderManager } from './uploaderManager';

const isDev = process.env.NODE_ENV === 'development';

export interface SettingConfiguration {
  /** 上传成功后链接复制的格式 */
  urlType: 'URL' | 'HTML' | 'Markdown';
  /** 默认的上传器配置文件 Id */
  defaultUploaderProfileId?: string;
  /** 代理设置 */
  proxy?: string;
  /** 自动复制 */
  autoCopy: boolean;
  /** 自动恢复粘贴板内容 */
  autoRecover: boolean;
  /** 是否显示系统通知 */
  showNotifaction: boolean;
  /** 是否发出系统提示音 */
  sound: boolean;
  /** 开启自启 */
  autoStart: boolean;
  /** 自动检查更新 */
  autoUpdate: boolean;
  /** 接收beta版本更新 */
  useBetaVersion: boolean;
  /** 上传前重命名 */
  rename: boolean;
  /** 重命名格式 */
  renameFormat: string;
  /** openWebServer */
  openWebServer: boolean;
  /** webserver port */
  webServerPort: number;
  openUploadShortcutKey: boolean;
  uploadShortcutKey: string;
}

// 默认设置
const defaultSettingConfigurtion: SettingConfiguration = {
  urlType: 'URL',
  autoCopy: true,
  autoRecover: false,
  showNotifaction: true,
  sound: true,
  autoStart: false,
  autoUpdate: false,
  useBetaVersion: false,
  rename: true,
  renameFormat: '{fileName}-{uuid:6}',
  openWebServer: false,
  webServerPort: 7777,
  openUploadShortcutKey: false,
  uploadShortcutKey: process.platform === 'darwin' ? 'Command+Shift+U' : 'Ctrl+Shift+U'
};

export class Setting {
  private static instance: Setting;

  static getInstance() {
    if (!Setting.instance) {
      Setting.instance = new Setting();
    }
    return Setting.instance;
  }

  configuration: SettingConfiguration;

  protected constructor() {
    this.configuration = (settingStore.get('setting') as SettingConfiguration) || defaultSettingConfigurtion;
  }

  get() {
    console.log('get setting configuration');
    return { ...defaultSettingConfigurtion, ...this.configuration };
  }

  update(configuration: SettingConfiguration) {
    console.log('update setting configuration');
    this.configuration = configuration;
    this.save();
    return this.configuration;
  }

  setUrlType(type: SettingConfiguration['urlType']) {
    console.log('update url type');
    this.configuration.urlType = type;
    this.save();
  }

  setDefaultUploaderProfile(id: string, flag = true) {
    console.log('update default uploader profile');
    if (flag) {
      this.configuration.defaultUploaderProfileId = id;
    } else if (this.configuration.defaultUploaderProfileId === id) {
      this.configuration.defaultUploaderProfileId = undefined;
    }
    this.save();
    return this.configuration;
  }

  deleteDefaultUploaderProfile(id: string) {
    console.log('delete default uplpader profile');
    if (this.configuration.defaultUploaderProfileId === id) {
      this.configuration.defaultUploaderProfileId = '';
      this.save();
    }
  }

  toggleUploadShortcutKey(shortcutKey: string) {
    console.log(`toggle upload shortcut key: ${shortcutKey}`);
    const isOpened = this.configuration.openUploadShortcutKey;
    if (isOpened) {
      globalShortcut.unregister(shortcutKey);
      this.configuration.openUploadShortcutKey = false;
      this.configuration.uploadShortcutKey = shortcutKey;
      this.save();
      return { toggle: false, success: true };
    } else {
      const res = globalShortcut.register(shortcutKey, () => {
        UploaderManager.getInstance().uploadFromClipboard();
      });
      if (res) {
        this.configuration.openUploadShortcutKey = true;
        this.configuration.uploadShortcutKey = shortcutKey;
        this.save();
      } else {
        globalShortcut.unregister(shortcutKey);
      }
      return { toggle: true, success: res };
    }
  }

  registerUploadShortcutKey() {
    if (this.configuration.openUploadShortcutKey) {
      const res = globalShortcut.register(this.configuration.uploadShortcutKey, () => {
        UploaderManager.getInstance().uploadFromClipboard();
      });
      if (res) {
        console.log('init register upload shortcut key success');
      } else {
        console.error('init register upload shortcut key failed');
      }
    }
  }

  copyDarwinWorkflow() {
    console.log('copy darwin workflow');
    const appPath = app.getAppPath();
    const destPath = path.join(app.getPath('home'), '/Library/Services/Upload by Aragorn.workflow');
    let workflowPath = '';
    if (isDev) {
      workflowPath = path.resolve(appPath, '../../extraResources/Darwin/Upload by Aragorn.workflow');
    } else {
      workflowPath = path.resolve(appPath, '../cli/Upload by Aragorn.workflow');
    }
    fs.copySync(workflowPath, destPath, { overwrite: true });
    return fs.existsSync(destPath);
  }

  async installCli() {
    try {
      console.log('install cli');
      const appPath = app.getAppPath();
      const destPath = '/usr/local/bin/aragorn';
      let cliPath = '';
      if (isDev) {
        cliPath = path.resolve(appPath, '../../extraResources/Darwin/aragorn.sh');
      } else {
        cliPath = path.resolve(appPath, '../cli/aragorn.sh');
      }
      const res = await new Promise((resolve, reject) => {
        exec(`ln -sf ${cliPath} ${destPath}`, err => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      });
      return res;
    } catch (err) {
      console.error(`install cli error: ${err.message}`);
    }
  }

  protected save() {
    settingStore.set('setting', this.configuration);
  }
}
