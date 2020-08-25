import { settingStore } from './store';

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
  useBetaVersion: false
};

export class Setting {
  private static instance: Setting;

  static getInstance() {
    if (!Setting.instance) {
      Setting.instance = new Setting();
    }
    return Setting.instance;
  }

  /** 基础设置信息 */
  configuration: SettingConfiguration;

  constructor() {
    this.configuration = (settingStore.get('setting') as SettingConfiguration) || defaultSettingConfigurtion;
  }

  get() {
    console.log('获取App设置');
    return this.configuration;
  }

  update(configuration: SettingConfiguration) {
    console.log('更新App设置');
    this.configuration = configuration;
    this.save();
    return this.configuration;
  }

  setDefaultUploaderProfile(id: string) {
    this.configuration.defaultUploaderProfileId = id;
    this.save();
    return this.configuration;
  }

  deleteDefaultUploaderProfile(id: string) {
    if (this.configuration.defaultUploaderProfileId === id) {
      this.configuration.defaultUploaderProfileId = '';
      this.save();
    }
  }

  protected save() {
    settingStore.set('setting', this.configuration);
  }
}
