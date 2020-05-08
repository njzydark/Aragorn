import { SettingConfiguration } from 'types';
import store from './store';

// 默认设置
const defaultSettingConfigurtion: SettingConfiguration = {
  urlType: 'URL',
  defaultUploader: '',
  proxy: '',
  autoCopy: true,
  autoRecover: false,
  showNotifaction: true,
  sound: true,
  autoStart: false,
  autoUpdate: false
};

export class Setting {
  private static instance: Setting;
  /** 基础设置信息 */
  configuration: SettingConfiguration;

  private constructor() {
    this.configuration = store.get('userSetting') || defaultSettingConfigurtion;
  }

  static getInstance() {
    if (!Setting.instance) {
      Setting.instance = new Setting();
    }
    return Setting.instance;
  }

  get() {
    console.log('获取App设置');
    return this.configuration;
  }

  update(configuration: SettingConfiguration) {
    console.log('更新App设置');
    this.configuration = configuration;
    store.set('userSetting', this.configuration);
    return this.configuration;
  }

  setDefaultUploader(uuid?: string) {
    this.configuration.defaultUploader = uuid;
    store.set('userSetting', this.configuration);
  }

  deleteDefaultUpload(uuid: string) {
    if (this.configuration.defaultUploader === uuid) {
      this.configuration.defaultUploader = '';
      store.set('userSetting', this.configuration);
    }
  }
}
